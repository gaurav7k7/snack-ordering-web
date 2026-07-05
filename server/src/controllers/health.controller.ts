import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  res.status(StatusCodes.OK).json(
    createApiResponse('API is healthy.', {
      service: 'snack-ordering-server',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
});
