import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

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
