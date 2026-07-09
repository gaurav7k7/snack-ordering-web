import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { USER_ROLES } from '../constants/roles.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import { generateToken, hashToken } from '../services/auth.service.js';
import { sendEmail } from '../services/email.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { escapeRegex } from '../utils/escapeRegex.js';

function assertManageable(target: { _id: unknown; role?: string | null }, requestingUserId?: string) {
  if (target._id?.toString() === requestingUserId) {
    throw new AppError('You cannot perform this action on your own account.', StatusCodes.BAD_REQUEST);
  }
  if (target.role === USER_ROLES.admin) {
    throw new AppError('Admin accounts cannot be managed from this screen.', StatusCodes.FORBIDDEN);
  }
}

export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
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
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Customers retrieved.', {
      customers,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
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
  const products = await ProductModel.find({ 'reviews.user': customerId })
    .select('name slug images reviews')
    .lean();

  const reviews = products
    .flatMap((product: any) =>
      (product.reviews ?? [])
        .filter((review: any) => review.user?.toString() === customerId)
        .map((review: any) => ({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images?.[0]?.url,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          createdAt: review.createdAt,
        })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(StatusCodes.OK).json(createApiResponse('Customer reviews retrieved.', { reviews }));
});

export const blockCustomer = asyncHandler(async (req, res) => {
  const customer = await UserModel.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', StatusCodes.NOT_FOUND);
  }
  assertManageable(customer, req.user?.userId);

  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  customer.isActive = false;
  customer.blockedAt = new Date();
  customer.blockedReason = reason || 'Blocked by admin';
  await customer.save();

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
  await sendEmail({
    to: customer.email,
    subject: 'Reset your SnackCo password',
    html: `<p>An administrator has requested a password reset for your account.</p><p>Reset your password by visiting <a href="${resetUrl}">this link</a>. This link expires in 1 hour.</p><p>If you did not expect this, please contact support.</p>`,
    text: `An administrator has requested a password reset for your account. Reset your password: ${resetUrl}`,
  });

  res.status(StatusCodes.OK).json(createApiResponse('Password reset email sent.'));
});
