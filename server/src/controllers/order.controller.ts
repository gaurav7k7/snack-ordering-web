import { StatusCodes } from 'http-status-codes';

import { ORDER_STATUS } from '../constants/orderStatus.js';
import { env } from '../config/env.js';
import { sendEmail } from '../services/email.service.js';
import { createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature } from '../services/razorpay.service.js';
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
  const isRazorpayPayment = paymentMethod === 'razorpay';

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
      provider: isRazorpayPayment ? 'razorpay' : 'cod',
      status: 'pending',
    },
    couponCode,
    giftCouponCode,
    guestEmail: effectiveEmail,
    guestName: effectiveName,
    guestPhone: effectivePhone,
    isGuest: Boolean(isGuest || !userId),
    status: isRazorpayPayment ? ORDER_STATUS.pending : ORDER_STATUS.confirmed,
  });

  if (isRazorpayPayment) {
    const razorpayOrder = await createRazorpayOrder(total, order._id.toString());
    order.payment = { ...(order.payment ?? {}), razorpayOrderId: razorpayOrder.id } as any;
    await order.save();

    return res.status(StatusCodes.CREATED).json(
      createApiResponse('Order prepared for payment.', {
        order,
        payment: {
          key: env.razorpayKeyId,
          amount: total,
          currency: 'INR',
          razorpayOrderId: razorpayOrder.id,
        },
      }),
    );
  }

  await sendEmail({
    to: effectiveEmail,
    subject: 'Your SnackCo order confirmation',
    text: `Hi ${effectiveName}, your order ${order.orderNumber} is confirmed. Total: ₹${total}.`,
    html: `<p>Hi ${effectiveName},</p><p>Your order <strong>${order.orderNumber}</strong> is confirmed.</p><p>Total: ₹${total}</p>`,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Order placed successfully.', { order }));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Payment details are incomplete.', StatusCodes.BAD_REQUEST);
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', StatusCodes.NOT_FOUND);
  }

  const isSignatureValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isSignatureValid) {
    order.payment = { ...(order.payment ?? {}), status: 'failed' } as any;
    order.status = ORDER_STATUS.pending;
    await order.save();
    throw new AppError('Payment verification failed.', StatusCodes.BAD_REQUEST);
  }

  order.payment = {
    ...(order.payment ?? {}),
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'paid',
  } as any;
  order.status = ORDER_STATUS.confirmed;
  await order.save();

  res.status(StatusCodes.OK).json(createApiResponse('Payment verified successfully.', { order }));
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.get('x-razorpay-signature');
  const body = req.body?.toString('utf8') ?? '';

  if (!signature || !verifyWebhookSignature(body, signature)) {
    throw new AppError('Invalid webhook signature.', StatusCodes.UNAUTHORIZED);
  }

  const event = JSON.parse(body);
  const paymentEntity = event?.payload?.payment?.entity;

  if (!paymentEntity?.order_id) {
    return res.status(StatusCodes.OK).json({ status: 'ok' });
  }

  const order = await OrderModel.findOne({ 'payment.razorpayOrderId': paymentEntity.order_id });

  if (!order) {
    return res.status(StatusCodes.OK).json({ status: 'ok' });
  }

  if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
    order.payment = { ...(order.payment ?? {}), razorpayPaymentId: paymentEntity.id, status: 'paid' } as any;
    order.status = ORDER_STATUS.confirmed;
    await order.save();
  }

  if (event.event === 'payment.failed') {
    order.payment = { ...(order.payment ?? {}), status: 'failed' } as any;
    order.status = ORDER_STATUS.pending;
    await order.save();
  }

  res.status(StatusCodes.OK).json({ status: 'ok' });
});
