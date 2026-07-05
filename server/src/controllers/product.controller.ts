import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listProducts = asyncHandler(async (_req, res) => {
  res.status(StatusCodes.OK).json(createApiResponse('Products endpoint ready.', []));
});
