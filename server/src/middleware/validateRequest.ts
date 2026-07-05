import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

import { AppError } from '../utils/AppError.js';

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const body = schemas.body?.safeParse(req.body);
    const params = schemas.params?.safeParse(req.params);
    const query = schemas.query?.safeParse(req.query);

    const firstError = [body, params, query].find((result) => result && !result.success);

    if (firstError && !firstError.success) {
      next(new AppError(firstError.error.issues[0]?.message ?? 'Invalid request data', 400));
      return;
    }

    if (body?.success) req.body = body.data;
    if (params?.success) req.params = params.data;
    if (query?.success) req.query = query.data;

    next();
  };
}
