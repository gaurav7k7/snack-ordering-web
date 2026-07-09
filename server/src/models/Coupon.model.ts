import { Schema, model, type InferSchemaType } from 'mongoose';

const redemptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    redeemedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 0 },
    isAutomatic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    redemptions: { type: [redemptionSchema], default: [] },
  },
  { timestamps: true },
);

couponSchema.index({ isAutomatic: 1, isActive: 1, validFrom: 1, validUntil: 1 });

export type Coupon = InferSchemaType<typeof couponSchema>;
export const CouponModel = model('Coupon', couponSchema);
