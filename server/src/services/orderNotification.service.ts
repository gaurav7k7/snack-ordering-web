import type { OrderStatus } from '../constants/orderStatus.js';
import { escapeHtml, renderEmailHtml } from '../utils/emailTemplates.js';
import { sendEmail } from './email.service.js';

type NotifiableOrder = {
  orderNumber: string;
  guestEmail?: string | null;
  guestName?: string | null;
  total?: number;
};

export async function sendOrderConfirmationEmail(order: NotifiableOrder) {
  if (!order.guestEmail) return;

  const name = order.guestName || 'there';

  await sendEmail({
    to: order.guestEmail,
    subject: `Your Lotus Delight order ${order.orderNumber} is confirmed`,
    text: `Hi ${name}, your order ${order.orderNumber} is confirmed. Total: ₹${order.total}.`,
    html: renderEmailHtml(
      'Order confirmed',
      `<p>Hi ${escapeHtml(name)},</p><p>Your order <strong>${order.orderNumber}</strong> is confirmed and being prepared.</p><p>Total: <strong>₹${order.total}</strong></p>`,
    ),
  });
}

const STATUS_EMAIL_COPY: Partial<Record<OrderStatus, { subject: string; message: string }>> = {
  packed: {
    subject: 'Your order has been packed',
    message: 'Your order has been packed and is ready to ship.',
  },
  shipped: {
    subject: 'Your order has shipped',
    message: 'Your order is on its way to you.',
  },
  out_for_delivery: {
    subject: 'Your order is out for delivery',
    message: 'Your order is out for delivery and should arrive today.',
  },
  delivered: {
    subject: 'Your order has been delivered',
    message: 'Your order has been delivered. We hope you enjoy your snacks!',
  },
};

export async function sendOrderStatusEmail(order: NotifiableOrder, status: OrderStatus) {
  const copy = STATUS_EMAIL_COPY[status];
  if (!copy || !order.guestEmail) return;

  await sendEmail({
    to: order.guestEmail,
    subject: `${copy.subject} — ${order.orderNumber}`,
    text: `${copy.message} Order: ${order.orderNumber}.`,
    html: renderEmailHtml(copy.subject, `<p>${copy.message}</p><p>Order: <strong>${order.orderNumber}</strong></p>`),
  });
}
