import type { ErrorRequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const message = isAppError ? error.message : 'Internal server error';

  if (!isAppError || statusCode >= 500) {
    logger.error(error.message, error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    stack: env.nodeEnv === 'development' ? error.stack : undefined,
  });
};
