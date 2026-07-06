import { StatusCodes } from 'http-status-codes';

import { sendEmail } from '../services/email.service.js';
import { OrderModel } from '../models/Order.model.js';
import { UserModel } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    deliveryInstructions,
    paymentMethod = 'cod',
    couponCode,
    giftCouponCode,
    guestName,
    guestEmail,
    guestPhone,
    isGuest = false,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Your cart is empty.', StatusCodes.BAD_REQUEST);
  }

  if (
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.postalCode
  ) {
    throw new AppError('Please provide a complete shipping address.', StatusCodes.BAD_REQUEST);
  }

  const userId = req.user?.userId;
  const user = userId ? await UserModel.findById(userId) : null;
  const effectiveName = guestName || user?.name || 'Guest Customer';
  const effectiveEmail = guestEmail || user?.email;
  const effectivePhone = guestPhone || shippingAddress.phone || user?.phone;

  if (!effectiveEmail) {
    throw new AppError('An email address is required to place an order.', StatusCodes.BAD_REQUEST);
  }

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  const couponDiscount = couponCode?.trim().toLowerCase() === 'snack10' ? subtotal * 0.1 : 0;
  const giftDiscount =
    giftCouponCode?.trim().toLowerCase() === 'gift50' ? Math.min(subtotal * 0.05, 100) : 0;
  const tax = Math.round(Math.max(subtotal - couponDiscount - giftDiscount, 0) * 0.18);
  const shippingFee = subtotal > 999 ? 0 : 69;
  const total = subtotal - couponDiscount - giftDiscount + tax + shippingFee;

  const order = await OrderModel.create({
    orderNumber: `SNK-${Date.now().toString().slice(-8)}`,
    user: userId,
    items: items.map((item: any) => ({
      product: item.productId,
      name: item.name,
      image: item.image,
      price: Number(item.price),
      quantity: Number(item.quantity),
    })),
    shippingAddress: {
      ...shippingAddress,
      fullName: shippingAddress.fullName || effectiveName,
      phone: shippingAddress.phone || effectivePhone,
      country: shippingAddress.country || 'India',
    },
    subtotal,
    shippingFee,
    tax,
    total,
    deliveryInstructions,
    payment: {
      provider: paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
      status: 'pending',
    },
    couponCode,
    giftCouponCode,
    guestEmail: effectiveEmail,
    guestName: effectiveName,
    guestPhone: effectivePhone,
    isGuest: Boolean(isGuest || !userId),
  });

  await sendEmail({
    to: effectiveEmail,
    subject: 'Your SnackCo order confirmation',
    text: `Hi ${effectiveName}, your order ${order.orderNumber} is confirmed. Total: ₹${total}.`,
    html: `<p>Hi ${effectiveName},</p><p>Your order <strong>${order.orderNumber}</strong> is confirmed.</p><p>Total: ₹${total}</p>`,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Order placed successfully.', { order }));
});
