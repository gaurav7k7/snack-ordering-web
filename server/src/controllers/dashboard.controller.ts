import { StatusCodes } from 'http-status-codes';

import { getDashboardStats } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const stats = await getDashboardStats();
  res.status(StatusCodes.OK).json(createApiResponse('Dashboard retrieved.', stats));
});
