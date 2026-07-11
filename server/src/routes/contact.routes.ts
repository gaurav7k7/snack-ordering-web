import { Router } from 'express';

import {
  getContactMessages,
  submitContactMessage,
  updateContactMessageStatus,
} from '../controllers/contact.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { contactLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { contactSchema } from '../validation/contact.validation.js';

export const contactRoutes = Router();

contactRoutes.post('/', contactLimiter, validateRequest({ body: contactSchema }), submitContactMessage);
contactRoutes.get('/', authenticate, authorize('admin'), getContactMessages);
contactRoutes.patch('/:id/status', authenticate, authorize('admin'), updateContactMessageStatus);
