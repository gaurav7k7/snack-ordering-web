import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (_req, res) => {
  res.status(StatusCodes.CREATED).json(createApiResponse('Registration endpoint ready.'));
});

export const login = asyncHandler(async (_req, res) => {
  res.status(StatusCodes.OK).json(createApiResponse('Login endpoint ready.'));
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(StatusCodes.OK).json(createApiResponse('Logged out successfully.'));
});
