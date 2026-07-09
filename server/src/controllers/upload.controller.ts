import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { cloudinary } from '../services/cloudinary.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

const UPLOAD_FOLDER = 'snackco';

export const getUploadSignature = asyncHandler(async (_req, res) => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError(
      'Image uploads are not configured on the server yet.',
      StatusCodes.SERVICE_UNAVAILABLE,
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: UPLOAD_FOLDER };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.cloudinaryApiSecret);

  res.status(StatusCodes.OK).json(
    createApiResponse('Upload signature generated.', {
      signature,
      timestamp,
      apiKey: env.cloudinaryApiKey,
      cloudName: env.cloudinaryCloudName,
      folder: UPLOAD_FOLDER,
    }),
  );
});
