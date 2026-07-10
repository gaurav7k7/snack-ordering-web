import { StatusCodes } from 'http-status-codes';

import { getDashboardStats } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { createTtlCache } from '../utils/ttlCache.js';

// The dashboard fans out into ~24 parallel queries/aggregations on every
// call — stats don't need to be sub-second fresh, so a short TTL cache
// collapses concurrent/rapid admin dashboard loads onto a single DB round
// trip instead of re-running the whole fan-out for every request.
const DASHBOARD_CACHE_TTL_MS = 60_000;
const dashboardCache = createTtlCache<Awaited<ReturnType<typeof getDashboardStats>>>(DASHBOARD_CACHE_TTL_MS);

export const getDashboard = asyncHandler(async (_req, res) => {
  let stats = dashboardCache.get();
  if (!stats) {
    stats = await getDashboardStats();
    dashboardCache.set(stats);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Dashboard retrieved.', stats));
});
