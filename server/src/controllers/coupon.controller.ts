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

type PopulatedRedemption = {
  user?: { _id: unknown; name: string; email: string } | null;
  guestEmail?: string | null;
  order?: { _id: unknown; orderNumber: string; total: number; status: string } | null;
  discountAmount?: number;
  redeemedAt: Date | string;
};

export const getCouponUsage = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);

  const coupon = await CouponModel.findById(req.params.id)
    .populate('redemptions.user', 'name email')
    .populate('redemptions.order', 'orderNumber total status');

  if (!coupon) {
    throw new AppError('Coupon not found.', StatusCodes.NOT_FOUND);
  }

  const redemptions = [...((coupon.redemptions ?? []) as unknown as PopulatedRedemption[])].sort(
    (a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
  );

  const totalDiscountGiven = redemptions.reduce((sum, redemption) => sum + (redemption.discountAmount ?? 0), 0);
  const uniqueCustomers = new Set(
    redemptions.map((redemption) => redemption.user?._id?.toString() ?? redemption.guestEmail ?? 'unknown'),
  ).size;

  const total = redemptions.length;
  const paged = redemptions.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);

  res.status(StatusCodes.OK).json(
    createApiResponse('Coupon usage retrieved.', {
      code: coupon.code,
      summary: {
        totalRedemptions: total,
        usageLimit: coupon.usageLimit ?? null,
        totalDiscountGiven,
        uniqueCustomers,
      },
      redemptions: paged.map((redemption) => ({
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
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});
