import { StatusCodes } from 'http-status-codes';
import { Resend } from 'resend';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

// Resend's sandbox mode (no verified sending domain) only allows sending
// from onboarding@resend.dev and only to the account owner's own inbox —
// set RESEND_FROM_EMAIL once a custom domain is verified in the Resend
// dashboard to lift that restriction.
const DEFAULT_FROM = 'SnackCo <onboarding@resend.dev>';

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.warn(`Email delivery skipped for ${options.to}: RESEND_API_KEY not configured.`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.resendFromEmail ?? DEFAULT_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`);
  }
}

// For flows where the email itself IS the point of the request (OTP delivery,
// password reset links) — sendEmail silently no-ops when Resend isn't
// configured, which would otherwise let these endpoints report false success
// ("check your email") while no email was ever sent. This throws instead, so
// a misconfigured environment surfaces as a clear, honest error.
export async function sendCriticalEmail(options: EmailOptions) {
  if (!resend) {
    throw new AppError(
      'Email delivery is not available right now. Please try again later or contact support.',
      StatusCodes.SERVICE_UNAVAILABLE,
    );
  }
  await sendEmail(options);
}
