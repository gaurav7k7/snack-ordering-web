import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { CANCELLABLE_STATUSES, ORDER_STATUS, RETURN_WINDOW_DAYS } from '../constants/orderStatus.js';
import { env } from '../config/env.js';
import { evaluateCouponByCode, findBestAutomaticOffer, redeemCouponByCode } from '../services/coupon.service.js';
import { sendEmail } from '../services/email.service.js';
import { generateInvoicePdf } from '../services/invoice.service.js';
import {
  createRazorpayOrder,
  refundPayment,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../services/razorpay.service.js';
import { OrderModel } from '../models/Order.model.js';
import { UserModel } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

async function loadOwnedOrder(orderId: string, userId?: string) {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', StatusCodes.NOT_FOUND);
  }

  if (!order.user || order.user.toString() !== userId) {
    throw new AppError('You do not have permission to access this order.', StatusCodes.FORBIDDEN);
  }

  return order;
}

async function loadOrderById(orderId: string) {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', StatusCodes.NOT_FOUND);
  }

  return order;
}

type OrderPayment = { provider?: string; status?: string; razorpayPaymentId?: string; refundId?: string };

// Best-effort refund used by flows where the primary action (cancel, status
// change) should still succeed even if the payment gateway call fails
// transiently — the failure is logged so an admin can retry manually via the
// dedicated refund action, which surfaces errors instead of swallowing them.
async function attemptAutoRefund(order: InstanceType<typeof OrderModel>, note: string) {
  const payment = order.payment as OrderPayment | undefined;
  const isPaidRazorpayOrder =
    payment?.status === 'paid' && payment?.provider === 'razorpay' && payment?.razorpayPaymentId;

  if (!isPaidRazorpayOrder) return;

  try {
    const refund = await refundPayment(payment.razorpayPaymentId as string, order.total);
    order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as never;
    order.status = ORDER_STATUS.refunded;
    (order as unknown as { _statusNote?: string })._statusNote = note;
    await order.save();
  } catch (error) {
    console.error(`Refund failed for order ${order.orderNumber}:`, error);
  }
}

async function performCancellation(order: InstanceType<typeof OrderModel>, reason: string, actor: 'customer' | 'admin') {
  if (!CANCELLABLE_STATUSES.includes(order.status as (typeof CANCELLABLE_STATUSES)[number])) {
    throw new AppError(
      `Orders that are already ${order.status} can no longer be cancelled.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const cancellationReason = reason || (actor === 'admin' ? 'Cancelled by admin' : 'Cancelled by customer');
  order.cancellation = { reason: cancellationReason, cancelledAt: new Date() };
  order.status = ORDER_STATUS.cancelled;
  (order as unknown as { _statusNote?: string })._statusNote = cancellationReason;
  await order.save();

  await attemptAutoRefund(order, 'Refund processed for cancelled order.');

  if (order.guestEmail) {
    await sendEmail({
      to: order.guestEmail,
      subject: `Your SnackCo order ${order.orderNumber} was cancelled`,
      text: `Hi, your order ${order.orderNumber} has been cancelled. Reason: ${cancellationReason}.`,
      html: `<p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p><p>Reason: ${cancellationReason}</p>`,
    });
  }

  return order;
}

async function redeemOrderCoupons(order: {
  couponCode?: string | null;
  automaticOfferCode?: string | null;
  user?: unknown;
  guestEmail?: string | null;
  _id: unknown;
}) {
  const userId = order.user ? String(order.user) : undefined;
  const guestEmail = order.guestEmail ?? undefined;
  const orderId = String(order._id);

  await Promise.all(
    [order.couponCode, order.automaticOfferCode]
      .filter((code): code is string => Boolean(code))
      .map((code) => redeemCouponByCode(code, { userId, guestEmail, orderId })),
  );
}

export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    deliveryInstructions,
    paymentMethod = 'cod',
    couponCode,
    guestName,
    guestEmail,
    guestPhone,
    isGuest = false,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Your cart is empty.', StatusCodes.BAD_REQUEST);
  }

  const invalidItem = items.find(
    (item: any) => !item?.productId || !mongoose.Types.ObjectId.isValid(item.productId),
  );
  if (invalidItem) {
    throw new AppError(
      `"${invalidItem?.name ?? 'An item'}" in your cart is out of date. Please remove it and add it again.`,
      StatusCodes.BAD_REQUEST,
    );
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

  let couponDiscount = 0;
  let validatedCouponCode = '';
  if (typeof couponCode === 'string' && couponCode.trim()) {
    const result = await evaluateCouponByCode(couponCode, {
      subtotal,
      userId,
      guestEmail: effectiveEmail,
    });
    if (result.error || !result.coupon) {
      throw new AppError(result.error ?? 'This coupon cannot be applied.', StatusCodes.BAD_REQUEST);
    }
    couponDiscount = result.discountAmount;
    validatedCouponCode = result.coupon.code;
  }

  const automaticOffer = await findBestAutomaticOffer({ subtotal, userId, guestEmail: effectiveEmail });
  const automaticDiscount = automaticOffer?.discountAmount ?? 0;
  const automaticOfferCode = automaticOffer?.coupon.code ?? '';

  const totalDiscount = Math.min(couponDiscount + automaticDiscount, subtotal);
  const tax = Math.round(Math.max(subtotal - totalDiscount, 0) * 0.18);
  const shippingFee = subtotal > 999 ? 0 : 69;
  const total = subtotal - totalDiscount + tax + shippingFee;
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
    couponCode: validatedCouponCode,
    couponDiscount,
    automaticOfferCode,
    automaticDiscount,
    guestEmail: effectiveEmail,
    guestName: effectiveName,
    guestPhone: effectivePhone,
    isGuest: Boolean(isGuest || !userId),
    status: isRazorpayPayment ? ORDER_STATUS.pending : ORDER_STATUS.confirmed,
  });

  if (!isRazorpayPayment) {
    await redeemOrderCoupons(order);
  }

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

  const wasAlreadyConfirmed = order.status === ORDER_STATUS.confirmed;

  order.payment = {
    ...(order.payment ?? {}),
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'paid',
  } as any;
  order.status = ORDER_STATUS.confirmed;
  await order.save();

  if (!wasAlreadyConfirmed) {
    await redeemOrderCoupons(order);
  }

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
    const wasAlreadyConfirmed = order.status === ORDER_STATUS.confirmed;

    order.payment = {
      ...(order.payment ?? {}),
      razorpayPaymentId: paymentEntity.id,
      status: 'paid',
    } as any;
    order.status = ORDER_STATUS.confirmed;
    await order.save();

    if (!wasAlreadyConfirmed) {
      await redeemOrderCoupons(order);
    }
  }

  if (event.event === 'payment.failed') {
    order.payment = { ...(order.payment ?? {}), status: 'failed' } as any;
    order.status = ORDER_STATUS.pending;
    await order.save();
  }

  res.status(StatusCodes.OK).json({ status: 'ok' });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;

  const filter: Record<string, unknown> = { user: req.user?.userId };
  if (statusFilter) {
    filter.status = statusFilter;
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Orders retrieved.', {
      orders,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    }),
  );
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const filter: Record<string, unknown> = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { orderNumber: pattern },
      { guestName: pattern },
      { guestEmail: pattern },
      { guestPhone: pattern },
    ];
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Orders retrieved.', {
      orders,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    }),
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  res.status(StatusCodes.OK).json(createApiResponse('Order retrieved.', { order }));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

  await performCancellation(order, reason, 'customer');

  res.status(StatusCodes.OK).json(createApiResponse('Order cancelled.', { order }));
});

export const requestReturn = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

  if (order.status !== ORDER_STATUS.delivered) {
    throw new AppError('Only delivered orders are eligible for a return.', StatusCodes.BAD_REQUEST);
  }

  if (!reason) {
    throw new AppError('Please tell us why you want to return this order.', StatusCodes.BAD_REQUEST);
  }

  const deliveredAt = order.deliveredAt ?? order.updatedAt ?? order.createdAt;
  const daysSinceDelivery = (Date.now() - new Date(deliveredAt as Date).getTime()) / 86_400_000;

  if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
    throw new AppError(
      `The return window (${RETURN_WINDOW_DAYS} days) for this order has closed.`,
      StatusCodes.BAD_REQUEST,
    );
  }

  order.returnRequest = { reason, requestedAt: new Date(), status: 'pending' };
  order.status = ORDER_STATUS.return_requested;
  (order as unknown as { _statusNote?: string })._statusNote = reason;
  await order.save();

  if (order.guestEmail) {
    await sendEmail({
      to: order.guestEmail,
      subject: `Return request received for order ${order.orderNumber}`,
      text: `We've received your return request for order ${order.orderNumber}. Our team will review it within 24-48 hours.`,
      html: `<p>We've received your return request for order <strong>${order.orderNumber}</strong>.</p><p>Our team will review it within 24-48 hours.</p>`,
    });
  }

  res.status(StatusCodes.OK).json(createApiResponse('Return request submitted.', { order }));
});

const ADMIN_SETTABLE_STATUSES = new Set<string>(Object.values(ORDER_STATUS));

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body ?? {};

  if (!status || !ADMIN_SETTABLE_STATUSES.has(status)) {
    throw new AppError('A valid order status is required.', StatusCodes.BAD_REQUEST);
  }

  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found.', StatusCodes.NOT_FOUND);
  }

  if (status === ORDER_STATUS.delivered) {
    order.deliveredAt = new Date();
  }

  const payment = order.payment as
    | { provider?: string; status?: string; razorpayPaymentId?: string }
    | undefined;

  if (
    status === ORDER_STATUS.refunded &&
    payment?.status !== 'refunded' &&
    payment?.provider === 'razorpay' &&
    payment?.razorpayPaymentId
  ) {
    try {
      const refund = await refundPayment(payment.razorpayPaymentId as string, order.total);
      order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as never;
    } catch (error) {
      console.error(`Refund failed for order ${order.orderNumber}:`, error);
    }
  }

  if (order.returnRequest && status === ORDER_STATUS.returned) {
    order.returnRequest = { ...order.returnRequest, status: 'approved', resolvedAt: new Date() } as never;
  }

  order.status = status;
  (order as unknown as { _statusNote?: string })._statusNote = typeof note === 'string' ? note : '';
  await order.save();

  res.status(StatusCodes.OK).json(createApiResponse('Order status updated.', { order }));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  const doc = generateInvoicePdf(order.toObject() as never);

  const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="invoice-${order.orderNumber}.pdf"`);

  doc.pipe(res);
  doc.end();
});

export const getOrderByIdForAdmin = asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    throw new AppError('Order not found.', StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Order retrieved.', { order }));
});

export const getInvoiceForAdmin = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const doc = generateInvoicePdf(order.toObject() as never);

  const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="invoice-${order.orderNumber}.pdf"`);

  doc.pipe(res);
  doc.end();
});

export const adminCancelOrder = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

  await performCancellation(order, reason, 'admin');

  res.status(StatusCodes.OK).json(createApiResponse('Order cancelled.', { order }));
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const { amount, reason } = req.body ?? {};

  const payment = order.payment as OrderPayment | undefined;

  if (payment?.status !== 'paid') {
    throw new AppError('This order does not have a captured payment to refund.', StatusCodes.BAD_REQUEST);
  }
  if (payment.provider !== 'razorpay' || !payment.razorpayPaymentId) {
    throw new AppError('Only online payments can be refunded through this action.', StatusCodes.BAD_REQUEST);
  }
  if (order.status === ORDER_STATUS.refunded) {
    throw new AppError('This order has already been refunded.', StatusCodes.BAD_REQUEST);
  }

  const refundAmount = Number(amount) > 0 ? Number(amount) : order.total;
  if (refundAmount > order.total) {
    throw new AppError('Refund amount cannot exceed the order total.', StatusCodes.BAD_REQUEST);
  }

  let refund;
  try {
    refund = await refundPayment(payment.razorpayPaymentId, refundAmount);
  } catch (error) {
    console.error(`Manual refund failed for order ${order.orderNumber}:`, error);
    throw new AppError(
      'Refund could not be processed. Check the Razorpay dashboard and try again.',
      StatusCodes.BAD_GATEWAY,
    );
  }

  const refundReason = typeof reason === 'string' && reason.trim() ? reason.trim() : `Refund of ₹${refundAmount} processed by admin.`;
  order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as never;
  order.status = ORDER_STATUS.refunded;
  (order as unknown as { _statusNote?: string })._statusNote = refundReason;
  await order.save();

  if (order.guestEmail) {
    await sendEmail({
      to: order.guestEmail,
      subject: `Refund processed for order ${order.orderNumber}`,
      text: `Hi, a refund of ₹${refundAmount} has been processed for your order ${order.orderNumber}.`,
      html: `<p>A refund of <strong>₹${refundAmount}</strong> has been processed for your order <strong>${order.orderNumber}</strong>.</p>`,
    });
  }

  res.status(StatusCodes.OK).json(createApiResponse('Refund processed.', { order }));
});

export const assignDelivery = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const { name, phone, notes, clear } = req.body ?? {};

  if (clear === true) {
    order.assignedDelivery = undefined;
    await order.save();
    res.status(StatusCodes.OK).json(createApiResponse('Delivery assignment cleared.', { order }));
    return;
  }

  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('A delivery partner name is required.', StatusCodes.BAD_REQUEST);
  }

  order.assignedDelivery = {
    name: name.trim(),
    phone: typeof phone === 'string' ? phone.trim() : '',
    notes: typeof notes === 'string' ? notes.trim() : '',
    assignedAt: new Date(),
  };
  await order.save();

  res.status(StatusCodes.OK).json(createApiResponse('Delivery assigned.', { order }));
});
