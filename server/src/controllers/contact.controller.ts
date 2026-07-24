import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { ContactMessageModel } from '../models/ContactMessage.model.js';
import { sendEmail } from '../services/email.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { parseDateRangeFilter } from '../utils/dateRange.js';
import { escapeHtml, renderEmailHtml } from '../utils/emailTemplates.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { logger } from '../utils/logger.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const resolvedSubject = subject?.trim() ? subject.trim() : 'General inquiry';

  const recentDuplicate = await ContactMessageModel.exists({
    email: email.toLowerCase().trim(),
    message: message.trim(),
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  });
  if (recentDuplicate) {
    throw new AppError(
      "You've already sent this message. We'll get back to you shortly.",
      StatusCodes.CONFLICT,
    );
  }

  const contactMessage = await ContactMessageModel.create({
    name,
    email,
    phone: phone?.trim() || undefined,
    subject: resolvedSubject,
    message,
  });

  if (!env.supportEmail) {
    // No inbox configured to receive it — the message is still saved and
    // visible to admins, so this isn't a hard failure, just a missed alert.
    res.status(StatusCodes.CREATED).json(createApiResponse('Message received.', { contactMessage }));
    return;
  }

  try {
    await sendEmail({
      to: env.supportEmail,
      subject: `[Customer Message] ${resolvedSubject}`,
      text: `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ''}\n\n${message}`,
      html: await renderEmailHtml(
        'New customer message',
        `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
         <p><strong>Email:</strong> ${escapeHtml(email)}</p>
         ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
         <p><strong>Subject:</strong> ${escapeHtml(resolvedSubject)}</p>
         <p><strong>Message:</strong><br />${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
      ),
    });
  } catch (error) {
    // The message is already saved and visible in the admin dashboard —
    // a failed notification email shouldn't turn a successful submission
    // into an error response for the customer.
    logger.error(`Contact notification email failed for message ${contactMessage._id}`, error);
  }

  res.status(StatusCodes.CREATED).json(createApiResponse('Message received.', { contactMessage }));
});

function buildContactFilter(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = { ...parseDateRangeFilter(query.range) };

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { subject: pattern }, { message: pattern }];
  }

  if (query.status === 'new' || query.status === 'read' || query.status === 'resolved') {
    filter.status = query.status;
  }

  return filter;
}

export const getContactMessages = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const filter = buildContactFilter(req.query);

  const [messages, total, totalMessages, unreadMessages] = await Promise.all([
    ContactMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean(),
    ContactMessageModel.countDocuments(filter),
    ContactMessageModel.countDocuments({}),
    ContactMessageModel.countDocuments({ status: 'new' }),
  ]);

  res.status(StatusCodes.OK).json(
    createApiResponse('Contact messages retrieved.', {
      messages,
      pagination: buildPaginationMeta(total, pagination),
      totalMessages,
      unreadMessages,
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

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessageModel.findByIdAndDelete(req.params.id);
  if (!contactMessage) {
    throw new AppError('Message not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Message deleted.'));
});
