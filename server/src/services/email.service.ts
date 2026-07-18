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
const DEFAULT_FROM = 'Lotus Delight <onboarding@resend.dev>';

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
    // Log the raw provider error server-side for debugging (e.g. Resend's
    // sandbox-mode "you can only send to your own verified email" 403), but
    // never surface that detail to the client — just an honest, generic
    // failure instead of the bare "Internal server error" a plain Error
    // would produce via the default error handler.
    console.error(`Resend email delivery failed for ${options.to}:`, error);
    throw new AppError(
      'We were unable to send that email right now. Please try again shortly.',
      StatusCodes.BAD_GATEWAY,
    );
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
