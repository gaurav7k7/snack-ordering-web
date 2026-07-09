import { StatusCodes } from 'http-status-codes';

import { AppError } from '../utils/AppError.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getProductBySlug,
  getSearchSuggestions,
  searchProducts,
} from '../services/product.service.js';

export const listProducts = asyncHandler(async (req, res) => {
  const response = await searchProducts(req.query);
  res.status(StatusCodes.OK).json(createApiResponse('Products retrieved successfully.', response));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductBySlug(req.params.slug);

  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Product retrieved successfully.', { product }));
});

export const getProductSearchSuggestions = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const response = await getSearchSuggestions(q);
  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Search suggestions retrieved successfully.', response));
});
