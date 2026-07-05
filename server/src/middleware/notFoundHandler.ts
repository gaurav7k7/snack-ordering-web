import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
