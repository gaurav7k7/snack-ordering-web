import { StatusCodes } from 'http-status-codes';

import { CouponModel } from '../models/Coupon.model.js';
import { evaluateCouponByCode, findBestAutomaticOffer } from '../services/coupon.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, guestEmail } = req.body ?? {};

  if (!code || typeof code !== 'string') {
    throw new AppError('A coupon code is required.', StatusCodes.BAD_REQUEST);
  }
  const numericSubtotal = Number(subtotal);
  if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
    throw new AppError('A valid cart subtotal is required.', StatusCodes.BAD_REQUEST);
  }

  const result = await evaluateCouponByCode(code, {
    subtotal: numericSubtotal,
    userId: req.user?.userId,
    guestEmail: typeof guestEmail === 'string' ? guestEmail : undefined,
  });

  if (result.error || !result.coupon) {
    throw new AppError(result.error ?? 'This coupon cannot be applied.', StatusCodes.BAD_REQUEST);
  }

  res.status(StatusCodes.OK).json(
    createApiResponse('Coupon applied.', {
      code: result.coupon.code,
      description: result.coupon.description,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountAmount: result.discountAmount,
    }),
  );
});

export const getAutomaticOffer = asyncHandler(async (req, res) => {
  const subtotal = Number(req.query.subtotal) || 0;
  const guestEmail = typeof req.query.guestEmail === 'string' ? req.query.guestEmail : undefined;

  const best = await findBestAutomaticOffer({
    subtotal,
    userId: req.user?.userId,
    guestEmail,
  });

  if (!best) {
    res.status(StatusCodes.OK).json(createApiResponse('No automatic offer available.', { offer: null }));
    return;
  }

  res.status(StatusCodes.OK).json(
    createApiResponse('Automatic offer available.', {
      offer: {
        code: best.coupon.code,
        description: best.coupon.description,
        discountAmount: best.discountAmount,
      },
    }),
  );
});

function validateCouponPayload(body: Record<string, unknown>, { partial }: { partial: boolean }) {
  const result: Record<string, unknown> = {};

  if (body.code !== undefined || !partial) {
    if (typeof body.code !== 'string' || !body.code.trim()) {
      throw new AppError('A coupon code is required.', StatusCodes.BAD_REQUEST);
    }
    result.code = body.code.trim().toUpperCase();
  }

  if (body.discountType !== undefined || !partial) {
    if (body.discountType !== 'percentage' && body.discountType !== 'flat') {
      throw new AppError('discountType must be "percentage" or "flat".', StatusCodes.BAD_REQUEST);
    }
    result.discountType = body.discountType;
  }

  if (body.discountValue !== undefined || !partial) {
    const value = Number(body.discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      throw new AppError('discountValue must be a positive number.', StatusCodes.BAD_REQUEST);
    }
    if ((body.discountType ?? result.discountType) === 'percentage' && value > 100) {
      throw new AppError('Percentage discounts cannot exceed 100.', StatusCodes.BAD_REQUEST);
    }
    result.discountValue = value;
  }

  if (body.maxDiscountAmount !== undefined) {
    result.maxDiscountAmount = body.maxDiscountAmount === null ? undefined : Number(body.maxDiscountAmount);
  }

  if (body.minOrderValue !== undefined) {
    result.minOrderValue = Math.max(Number(body.minOrderValue) || 0, 0);
  }

  if (body.validFrom !== undefined || !partial) {
    const date = new Date(body.validFrom as string);
    if (Number.isNaN(date.getTime())) {
      throw new AppError('A valid validFrom date is required.', StatusCodes.BAD_REQUEST);
    }
    result.validFrom = date;
  }

  if (body.validUntil !== undefined || !partial) {
    const date = new Date(body.validUntil as string);
    if (Number.isNaN(date.getTime())) {
      throw new AppError('A valid validUntil date is required.', StatusCodes.BAD_REQUEST);
    }
    result.validUntil = date;
  }

  if (result.validFrom && result.validUntil && result.validFrom >= result.validUntil) {
    throw new AppError('validUntil must be after validFrom.', StatusCodes.BAD_REQUEST);
  }

  if (body.usageLimit !== undefined) {
    result.usageLimit = body.usageLimit === null ? undefined : Math.max(Number(body.usageLimit) || 0, 0);
  }

  if (body.perUserLimit !== undefined) {
    result.perUserLimit = Math.max(Number(body.perUserLimit) || 0, 0);
  }

  if (body.isAutomatic !== undefined) {
    result.isAutomatic = Boolean(body.isAutomatic);
  }

  if (body.isActive !== undefined) {
    result.isActive = Boolean(body.isActive);
  }

  if (body.description !== undefined) {
    result.description = String(body.description).trim();
  }

  return result;
}

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json(createApiResponse('Coupons retrieved.', { coupons }));
});

export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.findById(req.params.id);
  if (!coupon) throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);
  res.status(StatusCodes.OK).json(createApiResponse('Coupon retrieved.', { coupon }));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const payload = validateCouponPayload(req.body ?? {}, { partial: false });

  const existing = await CouponModel.exists({ code: payload.code });
  if (existing) {
    throw new AppError('A coupon with this code already exists.', StatusCodes.CONFLICT);
  }

  const coupon = await CouponModel.create(payload);
  res.status(StatusCodes.CREATED).json(createApiResponse('Coupon created.', { coupon }));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.findById(req.params.id);
  if (!coupon) throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);

  const payload = validateCouponPayload(req.body ?? {}, { partial: true });

  if (payload.code && payload.code !== coupon.code) {
    const existing = await CouponModel.exists({ code: payload.code, _id: { $ne: coupon._id } });
    if (existing) {
      throw new AppError('A coupon with this code already exists.', StatusCodes.CONFLICT);
    }
  }

  Object.assign(coupon, payload);
  await coupon.save();

  res.status(StatusCodes.OK).json(createApiResponse('Coupon updated.', { coupon }));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);
  res.status(StatusCodes.OK).json(createApiResponse('Coupon deleted.'));
});
