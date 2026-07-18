import { StatusCodes } from 'http-status-codes';

import { SubscriberModel } from '../models/Subscriber.model.js';
import { sendEmail } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { renderEmailHtml } from '../utils/emailTemplates.js';

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existing = await SubscriberModel.findOne({ email });
  if (existing) {
    if (existing.isActive) {
      res.status(StatusCodes.OK).json(createApiResponse("You're already subscribed."));
      return;
    }
    existing.isActive = true;
    existing.unsubscribedAt = undefined;
    await existing.save();
  } else {
    await SubscriberModel.create({ email });
  }

  await sendEmail({
    to: email,
    subject: "You're subscribed to Lotus Delight",
    text: 'Thanks for subscribing! Look out for drops, deals, and seasonal launches in your inbox.',
    html: renderEmailHtml(
      "You're on the list!",
      '<p>Thanks for subscribing to Lotus Delight. Look out for drops, deals, and seasonal launches in your inbox.</p>',
    ),
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Subscribed successfully.'));
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await SubscriberModel.updateOne({ email }, { isActive: false, unsubscribedAt: new Date() });

  res.status(StatusCodes.OK).json(createApiResponse('Unsubscribed successfully.'));
});
