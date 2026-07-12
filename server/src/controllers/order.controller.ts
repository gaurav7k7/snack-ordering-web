import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { CANCELLABLE_STATUSES, ORDER_STATUS, RETURN_WINDOW_DAYS } from '../constants/orderStatus.js';
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, TAX_RATE } from '../constants/pricing.js';
import { env } from '../config/env.js';
import { evaluateCouponByCode, findBestAutomaticOffer, redeemCouponByCode } from '../services/coupon.service.js';
import { sendEmail } from '../services/email.service.js';
import { decrementStockAndAlert } from '../services/inventory.service.js';
import { generateInvoicePdf } from '../services/invoice.service.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/orderNotification.service.js';
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
import { escapeRegex } from '../utils/escapeRegex.js';
import { escapeHtml, renderEmailHtml } from '../utils/emailTemplates.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

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

type OrderPayment = {
  provider: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  refundId?: string;
};

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
    order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as OrderPayment;
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
      html: renderEmailHtml(
        'Order cancelled',
        `<p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p><p>Reason: ${escapeHtml(cancellationReason)}</p>`,
      ),
    });
  }

  return order;
}

function toStockItems(items: Array<{ product: unknown; quantity: number }>) {
  return items.map((item) => ({ productId: item.product, quantity: item.quantity }));
}

async function redeemOrderCoupons(order: {
  couponCode?: string | null;
  automaticOfferCode?: string | null;
  couponDiscount?: number | null;
  automaticDiscount?: number | null;
  user?: unknown;
  guestEmail?: string | null;
  _id: unknown;
}) {
  const userId = order.user ? String(order.user) : undefined;
  const guestEmail = order.guestEmail ?? undefined;
  const orderId = String(order._id);

  await Promise.all(
    [
      { code: order.couponCode, discountAmount: order.couponDiscount ?? 0 },
      { code: order.automaticOfferCode, discountAmount: order.automaticDiscount ?? 0 },
    ]
      .filter((entry): entry is { code: string; discountAmount: number } => Boolean(entry.code))
      .map((entry) => redeemCouponByCode(entry.code, { userId, guestEmail, orderId, discountAmount: entry.discountAmount })),
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
  const tax = Math.round(Math.max(subtotal - totalDiscount, 0) * TAX_RATE);
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
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
      country: shippingAddress.country || DEFAULT_COUNTRY,
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
    order.payment = { ...(order.payment ?? {}), razorpayOrderId: razorpayOrder.id } as OrderPayment;
    await order.save();

    return res.status(StatusCodes.CREATED).json(
      createApiResponse('Order prepared for payment.', {
        order,
        payment: {
          key: env.razorpayKeyId,
          amount: total,
          currency: DEFAULT_CURRENCY,
          razorpayOrderId: razorpayOrder.id,
        },
      }),
    );
  }

  await decrementStockAndAlert(toStockItems(order.items as never));
  await sendOrderConfirmationEmail(order);

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
    order.payment = { ...(order.payment ?? {}), status: 'failed' } as OrderPayment;
    order.status = ORDER_STATUS.pending;
    await order.save();
    throw new AppError('Payment verification failed.', StatusCodes.BAD_REQUEST);
  }

  // The client-driven verifyPayment call and the async Razorpay webhook
  // (handleRazorpayWebhook below) can both independently race to confirm
  // the same order. Without this guard, a race would double-decrement
  // stock, double-redeem coupons, and send two confirmation emails.
  const wasAlreadyConfirmed = order.status === ORDER_STATUS.confirmed;

  order.payment = {
    ...(order.payment ?? {}),
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'paid',
  } as OrderPayment;
  order.status = ORDER_STATUS.confirmed;
  await order.save();

  if (!wasAlreadyConfirmed) {
    await redeemOrderCoupons(order);
    await decrementStockAndAlert(toStockItems(order.items as never));
    await sendOrderConfirmationEmail(order);
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
    // See the matching comment in verifyPayment above — this guard prevents
    // double stock/coupon effects if both confirmation paths fire for the
    // same order.
    const wasAlreadyConfirmed = order.status === ORDER_STATUS.confirmed;

    order.payment = {
      ...(order.payment ?? {}),
      razorpayPaymentId: paymentEntity.id,
      status: 'paid',
    } as OrderPayment;
    order.status = ORDER_STATUS.confirmed;
    await order.save();

    if (!wasAlreadyConfirmed) {
      await redeemOrderCoupons(order);
      await decrementStockAndAlert(toStockItems(order.items as never));
      await sendOrderConfirmationEmail(order);
    }
  }

  if (event.event === 'payment.failed') {
    order.payment = { ...(order.payment ?? {}), status: 'failed' } as OrderPayment;
    order.status = ORDER_STATUS.pending;
    await order.save();
  }

  res.status(StatusCodes.OK).json({ status: 'ok' });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;

  const filter: Record<string, unknown> = { user: req.user?.userId };
  if (statusFilter) {
    filter.status = statusFilter;
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Orders retrieved.', {
      orders,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

  const filter: Record<string, unknown> = {};
  if (statusFilter) {
    filter.status = statusFilter;
  }
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    filter.user = userId;
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
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Orders retrieved.', {
      orders,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  res.status(StatusCodes.OK).json(createApiResponse('Order retrieved.', { order }));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  const reason = req.body.reason ?? '';

  await performCancellation(order, reason, 'customer');

  res.status(StatusCodes.OK).json(createApiResponse('Order cancelled.', { order }));
});

export const requestReturn = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  const { reason } = req.body;

  if (order.status !== ORDER_STATUS.delivered) {
    throw new AppError('Only delivered orders are eligible for a return.', StatusCodes.BAD_REQUEST);
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
      html: renderEmailHtml(
        'Return request received',
        `<p>We've received your return request for order <strong>${order.orderNumber}</strong>.</p><p>Our team will review it within 24-48 hours.</p>`,
      ),
    });
  }

  res.status(StatusCodes.OK).json(createApiResponse('Return request submitted.', { order }));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

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

  // Mirrors attemptAutoRefund's guard above: only ever refund a payment
  // that was actually captured ('paid'), not merely "not yet refunded" —
  // a pending/failed/COD payment must never reach the Razorpay refund call.
  if (
    status === ORDER_STATUS.refunded &&
    payment?.status === 'paid' &&
    payment?.provider === 'razorpay' &&
    payment?.razorpayPaymentId
  ) {
    try {
      const refund = await refundPayment(payment.razorpayPaymentId as string, order.total);
      order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as OrderPayment;
    } catch (error) {
      console.error(`Refund failed for order ${order.orderNumber}:`, error);
    }
  }

  if (order.returnRequest && status === ORDER_STATUS.returned) {
    order.returnRequest = { ...order.returnRequest, status: 'approved', resolvedAt: new Date() } as never;
  }

  const previousStatus = order.status;
  order.status = status;
  (order as unknown as { _statusNote?: string })._statusNote = typeof note === 'string' ? note : '';
  await order.save();

  if (status !== previousStatus) {
    await sendOrderStatusEmail(order, status);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Order status updated.', { order }));
});

function streamInvoice(order: InstanceType<typeof OrderModel>, req: Request, res: Response) {
  const doc = generateInvoicePdf(order.toObject() as never);

  const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="invoice-${order.orderNumber}.pdf"`);

  doc.pipe(res);
  doc.end();
}

export const getInvoice = asyncHandler(async (req, res) => {
  const order = await loadOwnedOrder(req.params.id, req.user?.userId);
  streamInvoice(order, req, res);
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
  streamInvoice(order, req, res);
});

export const adminCancelOrder = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const reason = req.body.reason ?? '';

  await performCancellation(order, reason, 'admin');

  res.status(StatusCodes.OK).json(createApiResponse('Order cancelled.', { order }));
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const { amount, reason } = req.body;

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

  const refundAmount = amount ?? order.total;
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

  const refundReason = reason || `Refund of ₹${refundAmount} processed by admin.`;
  order.payment = { ...(order.payment ?? {}), status: 'refunded', refundId: refund.id } as OrderPayment;
  order.status = ORDER_STATUS.refunded;
  (order as unknown as { _statusNote?: string })._statusNote = refundReason;
  await order.save();

  if (order.guestEmail) {
    await sendEmail({
      to: order.guestEmail,
      subject: `Refund processed for order ${order.orderNumber}`,
      text: `Hi, a refund of ₹${refundAmount} has been processed for your order ${order.orderNumber}.`,
      html: renderEmailHtml(
        'Refund processed',
        `<p>A refund of <strong>₹${refundAmount}</strong> has been processed for your order <strong>${order.orderNumber}</strong>.</p>`,
      ),
    });
  }

  res.status(StatusCodes.OK).json(createApiResponse('Refund processed.', { order }));
});

export const assignDelivery = asyncHandler(async (req, res) => {
  const order = await loadOrderById(req.params.id);
  const { name, phone, notes, clear } = req.body;

  if (clear === true) {
    order.assignedDelivery = undefined;
    await order.save();
    res.status(StatusCodes.OK).json(createApiResponse('Delivery assignment cleared.', { order }));
    return;
  }

  order.assignedDelivery = {
    name,
    phone: phone ?? '',
    notes: notes ?? '',
    assignedAt: new Date(),
  };
  await order.save();

  res.status(StatusCodes.OK).json(createApiResponse('Delivery assigned.', { order }));
});
