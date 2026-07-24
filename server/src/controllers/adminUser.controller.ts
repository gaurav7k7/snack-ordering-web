import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { USER_ROLES } from '../constants/roles.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import { generateToken, hashToken } from '../services/auth.service.js';
import { sendCriticalEmail } from '../services/email.service.js';
import { revokeAllUserSessions } from '../services/refreshToken.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { renderEmailHtml } from '../utils/emailTemplates.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

function assertManageable(target: { _id: unknown; role?: string | null }, requestingUserId?: string) {
  if (target._id?.toString() === requestingUserId) {
    throw new AppError('You cannot perform this action on your own account.', StatusCodes.BAD_REQUEST);
  }
  if (target.role === USER_ROLES.admin) {
    throw new AppError('Admin accounts cannot be managed from this screen.', StatusCodes.FORBIDDEN);
  }
}

export const getAllCustomers = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const filter: Record<string, unknown> = { role: USER_ROLES.customer };
  if (status === 'active') filter.isActive = true;
  if (status === 'blocked') filter.isActive = false;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }

  const [customers, total] = await Promise.all([
    UserModel.find(filter)
      .select('name email phone avatar isActive isEmailVerified blockedAt blockedReason createdAt')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Customers retrieved.', {
      customers,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await UserModel.findOne({ _id: req.params.id, role: USER_ROLES.customer });
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Customer retrieved.', { customer }));
});

export const getCustomerReviews = asyncHandler(async (req, res) => {
  const customerId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new AppError('Invalid customer id.', StatusCodes.BAD_REQUEST);
  }
  const customerObjectId = new mongoose.Types.ObjectId(customerId);
  const pagination = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  // Filtering/sorting/paging happens in the aggregation pipeline (both
  // $match stages plus a $facet for count+page) rather than loading every
  // matching product's full reviews array into Node and filtering in JS.
  const [result] = await ProductModel.aggregate([
    { $match: { 'reviews.user': customerObjectId } },
    { $unwind: '$reviews' },
    { $match: { 'reviews.user': customerObjectId } },
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
    createApiResponse('Customer reviews retrieved.', {
      reviews: result?.reviews ?? [],
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const blockCustomer = asyncHandler(async (req, res) => {
  const customer = await UserModel.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }
  assertManageable(customer, req.user?.userId);

  const reason = req.body.reason ?? '';
  customer.isActive = false;
  customer.blockedAt = new Date();
  customer.blockedReason = reason || 'Blocked by admin';
  await customer.save();
  await revokeAllUserSessions(customer._id.toString());

  res.status(StatusCodes.OK).json(createApiResponse('Customer blocked.', { customer }));
});

export const unblockCustomer = asyncHandler(async (req, res) => {
  const customer = await UserModel.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }
  assertManageable(customer, req.user?.userId);

  customer.isActive = true;
  customer.blockedAt = undefined;
  customer.blockedReason = undefined;
  await customer.save();

  res.status(StatusCodes.OK).json(createApiResponse('Customer unblocked.', { customer }));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await UserModel.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }
  assertManageable(customer, req.user?.userId);

  await UserModel.deleteOne({ _id: customer._id });

  res.status(StatusCodes.OK).json(createApiResponse('Customer deleted.'));
});

export const resetCustomerPassword = asyncHandler(async (req, res) => {
  const customer = await UserModel.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }

  const resetToken = generateToken(24);
  customer.passwordResetToken = hashToken(resetToken);
  customer.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60);
  await customer.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(customer.email)}`;
  await sendCriticalEmail({
    to: customer.email,
    subject: 'Reset your Lotus Delight password',
    html: await renderEmailHtml(
      'Reset your password',
      `<p>An administrator has requested a password reset for your account.</p><p>Reset your password by visiting <a href="${resetUrl}">this link</a>. This link expires in 1 hour.</p><p>If you did not expect this, please contact support.</p>`,
    ),
    text: `An administrator has requested a password reset for your account. Reset your password: ${resetUrl}`,
  });

  res.status(StatusCodes.OK).json(createApiResponse('Password reset email sent.'));
});
