import crypto from 'crypto';
import Razorpay from 'razorpay';

import { env } from '../config/env.js';
import { DEFAULT_CURRENCY } from '../constants/pricing.js';

const razorpayClient =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({
        key_id: env.razorpayKeyId,
        key_secret: env.razorpayKeySecret,
      })
    : null;

export async function createRazorpayOrder(amount: number, receipt: string) {
  if (!razorpayClient) {
    throw new Error('Razorpay is not configured.');
  }

  return razorpayClient.orders.create({
    // Razorpay's API takes amounts in the smallest currency unit (paise for
    // INR, i.e. rupees * 100), not rupees.
    amount: Math.round(amount * 100),
    currency: DEFAULT_CURRENCY,
    receipt,
    notes: {
      platform: 'SnackCo',
    },
  });
}

export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  if (!env.razorpayKeySecret) {
    throw new Error('Razorpay is not configured.');
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

export async function refundPayment(paymentId: string, amountInRupees?: number) {
  if (!razorpayClient) {
    throw new Error('Razorpay is not configured.');
  }

  return razorpayClient.payments.refund(paymentId, {
    // Same rupees-to-paise conversion as createRazorpayOrder above.
    ...(amountInRupees ? { amount: Math.round(amountInRupees * 100) } : {}),
  });
}

export function verifyWebhookSignature(body: string, signature: string) {
  if (!env.razorpayKeySecret) {
    throw new Error('Razorpay is not configured.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}
