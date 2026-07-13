import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { OrderModel } from '../models/Order.model.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import { PRODUCT_CARD_FIELDS } from '../services/product.service.js';
import { toUserProfile } from '../services/userSerializer.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId).lean();
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res.status(StatusCodes.OK).json(createApiResponse('Profile retrieved.', { user: toUserProfile(user) }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const { name, phone, avatar } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Profile updated.', { user: toUserProfile(user) }));
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const avatar = req.body.avatar ?? req.body.image;

  user.avatar = avatar;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Profile picture updated.', { user: toUserProfile(user) }));
});

export const updateAddresses = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  user.addresses = req.body.addresses ?? [];
  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Addresses updated.', { user: toUserProfile(user) }));
});

// This only ever backs the profile page's "recent orders" preview (which
// slices to 4 client-side) — the full paginated history lives behind
// getMyOrders/OrdersPage, so there's no reason to load a customer's entire
// order history here.
export const getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await OrderModel.find({ user: req.user?.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.status(StatusCodes.OK).json(createApiResponse('Orders retrieved.', { orders }));
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId).select('wishlist');
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const allIds = (user.wishlist ?? []) as mongoose.Types.ObjectId[];
  const pagination = parsePagination(req.query, { defaultLimit: 20, maxLimit: 60 });
  const pageIds = allIds.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  const products = await ProductModel.find({ _id: { $in: pageIds } })
    .select(PRODUCT_CARD_FIELDS)
    .populate('category', 'name slug')
    .lean();
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const wishlist = pageIds.map((id) => productsById.get(id.toString())).filter(Boolean);

  res.status(StatusCodes.OK).json(
    createApiResponse('Wishlist retrieved.', {
      wishlist,
      pagination: buildPaginationMeta(allIds.length, pagination),
    }),
  );
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product.', StatusCodes.BAD_REQUEST);
  }

  const product = await ProductModel.findOne({ _id: productId, isActive: true }).select('_id');
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.userId,
    { $addToSet: { wishlist: productId } },
    { new: true },
  ).populate({ path: 'wishlist', select: PRODUCT_CARD_FIELDS, populate: { path: 'category', select: 'name slug' } });
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Added to wishlist.', { wishlist: user.wishlist ?? [] }));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await UserModel.findByIdAndUpdate(
    req.user?.userId,
    { $pull: { wishlist: productId } },
    { new: true },
  ).populate({ path: 'wishlist', select: PRODUCT_CARD_FIELDS, populate: { path: 'category', select: 'name slug' } });
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Removed from wishlist.', { wishlist: user.wishlist ?? [] }));
});

export const getWallet = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(
      createApiResponse('Wallet retrieved.', {
        wallet: user.wallet ?? { balance: 0, currency: 'INR' },
      }),
    );
});

export const getNotifications = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(
      createApiResponse('Notifications retrieved.', { notifications: user.notifications ?? [] }),
    );
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId).select('+password');
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const { currentPassword, newPassword } = req.body;
  if (!user.password || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', StatusCodes.BAD_REQUEST);
  }

  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Password changed successfully.'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  user.isActive = false;
  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Account deleted.'));
});

export const getSupportTickets = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(
      createApiResponse('Support tickets retrieved.', {
        supportTickets: user.supportTickets ?? [],
      }),
    );
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(
      createApiResponse('Recently viewed retrieved.', {
        recentlyViewed: user.recentlyViewed ?? [],
      }),
    );
});

export const getReviewHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const pagination = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  // Same aggregation shape as adminUser.controller.ts's getCustomerReviews —
  // filters/pages at the DB level instead of loading every matching
  // product's full reviews array into Node and filtering in JS.
  const [result] = await ProductModel.aggregate([
    { $match: { 'reviews.user': userObjectId } },
    { $unwind: '$reviews' },
    { $match: { 'reviews.user': userObjectId } },
    { $sort: { 'reviews.createdAt': -1 } },
    {
      $project: {
        _id: '$reviews._id',
        productId: '$_id',
        productName: '$name',
        productSlug: '$slug',
        productImage: { $arrayElemAt: ['$images.url', 0] },
        rating: '$reviews.rating',
        title: '$reviews.title',
        comment: '$reviews.comment',
        status: '$reviews.status',
        createdAt: '$reviews.createdAt',
      },
    },
    {
      $facet: {
        reviews: [{ $skip: (pagination.page - 1) * pagination.limit }, { $limit: pagination.limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result?.totalCount?.[0]?.count ?? 0;

  res.status(StatusCodes.OK).json(
    createApiResponse('Review history retrieved.', {
      reviews: result?.reviews ?? [],
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});
