import { StatusCodes } from 'http-status-codes';

import { CouponModel } from '../models/Coupon.model.js';
import { evaluateCouponByCode, findBestAutomaticOffer } from '../services/coupon.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, guestEmail } = req.body;

  const result = await evaluateCouponByCode(code, {
    subtotal,
    userId: req.user?.userId,
    guestEmail,
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

export const listCoupons = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });

  const [coupons, total] = await Promise.all([
    CouponModel.find()
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit),
    CouponModel.countDocuments(),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Coupons retrieved.', {
      coupons,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.findById(req.params.id);
  if (!coupon) throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);
  res.status(StatusCodes.OK).json(createApiResponse('Coupon retrieved.', { coupon }));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const payload = req.body;

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

  const payload = req.body;

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

export const getCouponUsage = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const coupon = await CouponModel.findById(req.params.id)
    .populate('redemptions.user', 'name email')
    .populate('redemptions.order', 'orderNumber total status');

  if (!coupon) {
    throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);
  }

  const redemptions = [...(coupon.redemptions ?? [])].sort(
    (a: any, b: any) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
  );

  const totalDiscountGiven = redemptions.reduce((sum: number, redemption: any) => sum + (redemption.discountAmount ?? 0), 0);
  const uniqueCustomers = new Set(
    redemptions.map((redemption: any) => redemption.user?._id?.toString() ?? redemption.guestEmail ?? 'unknown'),
  ).size;

  const total = redemptions.length;
  const paged = redemptions.slice((page - 1) * limit, page * limit);

  res.status(StatusCodes.OK).json(
    createApiResponse('Coupon usage retrieved.', {
      code: coupon.code,
      summary: {
        totalRedemptions: total,
        usageLimit: coupon.usageLimit ?? null,
        totalDiscountGiven,
        uniqueCustomers,
      },
      redemptions: paged.map((redemption: any) => ({
        user: redemption.user
          ? { _id: redemption.user._id, name: redemption.user.name, email: redemption.user.email }
          : null,
        guestEmail: redemption.guestEmail ?? null,
        order: redemption.order
          ? {
              _id: redemption.order._id,
              orderNumber: redemption.order.orderNumber,
              total: redemption.order.total,
              status: redemption.order.status,
            }
          : null,
        discountAmount: redemption.discountAmount ?? 0,
        redeemedAt: redemption.redeemedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    }),
  );
});
