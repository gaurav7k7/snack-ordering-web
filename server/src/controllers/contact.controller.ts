import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { ContactMessageModel } from '../models/ContactMessage.model.js';
import { sendEmail } from '../services/email.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { escapeHtml, renderEmailHtml } from '../utils/emailTemplates.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contactMessage = await ContactMessageModel.create({ name, email, subject, message });

  if (!env.supportEmail) {
    // No inbox configured to receive it — the message is still saved and
    // visible to admins, so this isn't a hard failure, just a missed alert.
    res.status(StatusCodes.CREATED).json(createApiResponse('Message received.', { contactMessage }));
    return;
  }

  await sendEmail({
    to: env.supportEmail,
    subject: `[Contact] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: renderEmailHtml(
      'New contact form submission',
      `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
    ),
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Message received.', { contactMessage }));
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);

  const [messages, total] = await Promise.all([
    ContactMessageModel.find()
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit),
    ContactMessageModel.countDocuments(),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Contact messages retrieved.', {
      messages,
      pagination: buildPaginationMeta(total, pagination),
    }),
  );
});

export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body ?? {};
  if (!['new', 'read', 'resolved'].includes(status)) {
    throw new AppError('Status must be "new", "read", or "resolved".', StatusCodes.BAD_REQUEST);
  }

  const contactMessage = await ContactMessageModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!contactMessage) {
    throw new AppError('Message not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Message updated.', { contactMessage }));
});
