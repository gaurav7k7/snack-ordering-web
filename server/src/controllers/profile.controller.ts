import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { OrderModel } from '../models/Order.model.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import { PRODUCT_CARD_FIELDS } from '../services/product.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

function mapUser(user: any) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    addresses: user.addresses ?? [],
    wishlist: user.wishlist ?? [],
    coupons: user.coupons ?? [],
    wallet: user.wallet ?? { balance: 0, currency: 'INR' },
    notifications: user.notifications ?? [],
    recentlyViewed: user.recentlyViewed ?? [],
    supportTickets: user.supportTickets ?? [],
    reviews: user.reviews ?? [],
  };
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId).lean();
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res.status(StatusCodes.OK).json(createApiResponse('Profile retrieved.', { user: mapUser(user) }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const { name, phone, avatar } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Profile updated.', { user: mapUser(user) }));
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  const avatar = req.body?.avatar ?? req.body?.image;
  if (!avatar) throw new AppError('Avatar is required.', StatusCodes.BAD_REQUEST);

  user.avatar = avatar;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Profile picture updated.', { user: mapUser(user) }));
});

export const updateAddresses = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  user.addresses = req.body.addresses ?? [];
  await user.save();
  res.status(StatusCodes.OK).json(createApiResponse('Addresses updated.', { user: mapUser(user) }));
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
  const user = await UserModel.findById(req.user?.userId).populate('wishlist', PRODUCT_CARD_FIELDS);
  if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Wishlist retrieved.', { wishlist: user.wishlist ?? [] }));
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
  ).populate('wishlist', PRODUCT_CARD_FIELDS);
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
  ).populate('wishlist', PRODUCT_CARD_FIELDS);
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

  // Same aggregation shape as adminUser.controller.ts's getCustomerReviews —
  // filters at the DB level instead of loading every matching product's
  // full reviews array into Node and filtering in JS.
  const reviews = await ProductModel.aggregate([
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
  ]);

  res.status(StatusCodes.OK).json(createApiResponse('Review history retrieved.', { reviews }));
});
