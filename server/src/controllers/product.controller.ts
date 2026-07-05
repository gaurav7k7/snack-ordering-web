import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSearchSuggestions, searchProducts } from '../services/product.service.js';

export const listProducts = asyncHandler(async (req, res) => {
  const response = await searchProducts(req.query);
  res.status(StatusCodes.OK).json(createApiResponse('Products retrieved successfully.', response));
});

export const getProductSearchSuggestions = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const response = await getSearchSuggestions(q);
  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Search suggestions retrieved successfully.', response));
});
