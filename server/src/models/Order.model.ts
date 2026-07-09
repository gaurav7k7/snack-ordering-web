import { Schema, model, type InferSchemaType } from 'mongoose';

import { ORDER_STATUS } from '../constants/orderStatus.js';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const statusHistoryEntrySchema = new Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryInstructions: { type: String, default: '' },
    couponCode: { type: String, default: '' },
    giftCouponCode: { type: String, default: '' },
    guestEmail: { type: String },
    guestName: { type: String },
    guestPhone: { type: String },
    isGuest: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.pending,
    },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },
    deliveredAt: { type: Date },
    cancellation: {
      reason: { type: String },
      cancelledAt: { type: Date },
    },
    returnRequest: {
      reason: { type: String },
      requestedAt: { type: Date },
      status: { type: String, enum: ['pending', 'approved', 'rejected'] },
      resolvedAt: { type: Date },
    },
    payment: {
      provider: { type: String, default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, default: 'pending' },
      refundId: String,
    },
  },
  { timestamps: true },
);

orderSchema.pre('save', function pushStatusHistory(next) {
  if (this.isModified('status')) {
    this.statusHistory = this.statusHistory ?? [];
    this.statusHistory.push({
      status: this.status,
      note: (this as unknown as { _statusNote?: string })._statusNote ?? '',
      timestamp: new Date(),
    } as never);
  }
  next();
});

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = model('Order', orderSchema);
