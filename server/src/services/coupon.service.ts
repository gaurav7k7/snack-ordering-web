import { CouponModel, type Coupon } from '../models/Coupon.model.js';

type EvalContext = {
  subtotal: number;
  userId?: string;
  guestEmail?: string;
};

type CouponDocument = Coupon & { _id: unknown; save: () => Promise<unknown> };

function isCurrentlyValid(coupon: CouponDocument) {
  const now = new Date();
  return coupon.isActive && coupon.validFrom <= now && coupon.validUntil >= now;
}

function hasUsageLeft(coupon: CouponDocument) {
  return !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
}

function userRedemptionCount(coupon: CouponDocument, { userId, guestEmail }: EvalContext) {
  return (coupon.redemptions ?? []).filter((redemption) => {
    if (userId && redemption.user) return redemption.user.toString() === userId;
    if (!userId && guestEmail && redemption.guestEmail) return redemption.guestEmail === guestEmail;
    return false;
  }).length;
}

function hasPerUserUsageLeft(coupon: CouponDocument, ctx: EvalContext) {
  if (!coupon.perUserLimit) return true;
  if (!ctx.userId && !ctx.guestEmail) return true;
  return userRedemptionCount(coupon, ctx) < coupon.perUserLimit;
}

export function computeDiscountAmount(coupon: Pick<Coupon, 'discountType' | 'discountValue' | 'maxDiscountAmount'>, subtotal: number) {
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.discountValue) / 100;
    const capped = coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
    return Math.round(Math.min(capped, subtotal));
  }

  return Math.round(Math.min(coupon.discountValue, subtotal));
}

export async function evaluateCouponByCode(code: string, ctx: EvalContext) {
  const coupon = (await CouponModel.findOne({ code: code.trim().toUpperCase() })) as CouponDocument | null;

  if (!coupon) {
    return { error: 'This coupon code was not found.' };
  }
  if (!isCurrentlyValid(coupon)) {
    return { error: 'This coupon is expired or not yet active.' };
  }
  if (ctx.subtotal < coupon.minOrderValue) {
    return { error: `Add ₹${Math.ceil(coupon.minOrderValue - ctx.subtotal)} more to your cart to use this coupon.` };
  }
  if (!hasUsageLeft(coupon)) {
    return { error: 'This coupon has reached its usage limit.' };
  }
  if (!hasPerUserUsageLeft(coupon, ctx)) {
    return { error: 'You have already used this coupon.' };
  }

  return { coupon, discountAmount: computeDiscountAmount(coupon, ctx.subtotal) };
}

export async function findBestAutomaticOffer(ctx: EvalContext) {
  const now = new Date();
  const candidates = (await CouponModel.find({
    isAutomatic: true,
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    minOrderValue: { $lte: ctx.subtotal },
  })) as CouponDocument[];

  const eligible = candidates.filter((coupon) => hasUsageLeft(coupon) && hasPerUserUsageLeft(coupon, ctx));
  if (!eligible.length) return null;

  const withDiscounts = eligible.map((coupon) => ({
    coupon,
    discountAmount: computeDiscountAmount(coupon, ctx.subtotal),
  }));
  withDiscounts.sort((a, b) => b.discountAmount - a.discountAmount);

  return withDiscounts[0].discountAmount > 0 ? withDiscounts[0] : null;
}

export async function redeemCoupon(
  coupon: CouponDocument,
  { userId, guestEmail, orderId }: { userId?: string; guestEmail?: string; orderId: string },
) {
  coupon.usageCount += 1;
  coupon.redemptions = [
    ...(coupon.redemptions ?? []),
    { user: userId, guestEmail, order: orderId, redeemedAt: new Date() },
  ] as never;
  await coupon.save();
}

export async function redeemCouponByCode(
  code: string,
  { userId, guestEmail, orderId }: { userId?: string; guestEmail?: string; orderId: string },
) {
  const coupon = (await CouponModel.findOne({ code: code.trim().toUpperCase() })) as CouponDocument | null;
  if (!coupon) return;
  await redeemCoupon(coupon, { userId, guestEmail, orderId });
}
