import { StatusCodes } from 'http-status-codes';

import { getDashboardStats, SALES_GRAPH_DAY_OPTIONS, type SalesGraphDays } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { createKeyedTtlCache } from '../utils/ttlCache.js';

// The dashboard fans out into ~24 parallel queries/aggregations on every
// call — stats don't need to be sub-second fresh, so a short TTL cache
// collapses concurrent/rapid admin dashboard loads onto a single DB round
// trip instead of re-running the whole fan-out for every request. Keyed by
// the sales-graph range so switching between 7/30/90 days doesn't serve a
// stale graph for a different range.
const DASHBOARD_CACHE_TTL_MS = 60_000;
const dashboardCache = createKeyedTtlCache<Awaited<ReturnType<typeof getDashboardStats>>>(DASHBOARD_CACHE_TTL_MS);

export const getDashboard = asyncHandler(async (req, res) => {
  const requestedDays = Number(req.query.days);
  const salesGraphDays: SalesGraphDays = SALES_GRAPH_DAY_OPTIONS.includes(requestedDays as SalesGraphDays)
    ? (requestedDays as SalesGraphDays)
    : 30;

  const cacheKey = String(salesGraphDays);
  let stats = dashboardCache.get(cacheKey);
  if (!stats) {
    stats = await getDashboardStats(salesGraphDays);
    dashboardCache.set(cacheKey, stats);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Dashboard retrieved.', stats));
});
