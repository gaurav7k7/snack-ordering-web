import { StatusCodes } from 'http-status-codes';

import { ProductModel } from '../models/Product.model.js';
import { TagModel } from '../models/Tag.model.js';
import { ensureUniqueSlug } from '../services/slug.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { slugify } from '../utils/slugify.js';

export const listTags = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };
  const tags = await TagModel.find(filter).sort({ name: 1 });

  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Tags retrieved.', { tags }));
});

export const createTag = asyncHandler(async (req, res) => {
  const trimmedName = req.body.name.toLowerCase();

  const existing = await TagModel.exists({ name: trimmedName });
  if (existing) {
    throw new AppError('This tag already exists.', StatusCodes.CONFLICT);
  }

  const slug = await ensureUniqueSlug(TagModel, slugify(trimmedName));

  const tag = await TagModel.create({ name: trimmedName, slug });

  res.status(StatusCodes.CREATED).json(createApiResponse('Tag created.', { tag }));
});

export const updateTag = asyncHandler(async (req, res) => {
  const tag = await TagModel.findById(req.params.id);
  if (!tag) {
    throw new AppError('Tag not found.', StatusCodes.NOT_FOUND);
  }

  const { name, isActive } = req.body;
  const previousName = tag.name;

  if (name && name.toLowerCase() !== tag.name) {
    const trimmedName = name.toLowerCase();
    const existing = await TagModel.exists({ name: trimmedName, _id: { $ne: tag._id } });
    if (existing) {
      throw new AppError('This tag already exists.', StatusCodes.CONFLICT);
    }
    tag.name = trimmedName;
    tag.slug = await ensureUniqueSlug(TagModel, slugify(trimmedName), tag._id.toString());
  }

  if (typeof isActive === 'boolean') tag.isActive = isActive;

  await tag.save();

  if (tag.name !== previousName) {
    await ProductModel.updateMany(
      { tags: previousName },
      { $set: { 'tags.$[elem]': tag.name } },
      { arrayFilters: [{ elem: previousName }] },
    );
  }

  res.status(StatusCodes.OK).json(createApiResponse('Tag updated.', { tag }));
});

export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await TagModel.findById(req.params.id);
  if (!tag) {
    throw new AppError('Tag not found.', StatusCodes.NOT_FOUND);
  }

  await ProductModel.updateMany({ tags: tag.name }, { $pull: { tags: tag.name } });
  await TagModel.deleteOne({ _id: tag._id });

  res.status(StatusCodes.OK).json(createApiResponse('Tag deleted and removed from any products using it.'));
});
