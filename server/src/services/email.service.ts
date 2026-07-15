import nodemailer from 'nodemailer';
import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const transporter = env.smtpHost
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

export async function sendEmail(options: EmailOptions) {
  if (!transporter) {
    console.warn(`Email delivery skipped for ${options.to}: SMTP not configured.`);
    return;
  }

  await transporter.sendMail({
    from: env.smtpFrom ?? `SnackCo <${env.smtpUser ?? 'no-reply@example.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

// For flows where the email itself IS the point of the request (OTP delivery,
// password reset links) — sendEmail silently no-ops when SMTP isn't
// configured, which would otherwise let these endpoints report false success
// ("check your email") while no email was ever sent. This throws instead, so
// a misconfigured environment surfaces as a clear, honest error.
export async function sendCriticalEmail(options: EmailOptions) {
  if (!transporter) {
    throw new AppError(
      'Email delivery is not available right now. Please try again later or contact support.',
      StatusCodes.SERVICE_UNAVAILABLE,
    );
  }
  await sendEmail(options);
}
