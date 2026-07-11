import { Router } from 'express';

import { subscribe, unsubscribe } from '../controllers/newsletter.controller.js';
import { newsletterLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { subscribeSchema } from '../validation/newsletter.validation.js';

export const newsletterRoutes = Router();

newsletterRoutes.post('/subscribe', newsletterLimiter, validateRequest({ body: subscribeSchema }), subscribe);
newsletterRoutes.post('/unsubscribe', validateRequest({ body: subscribeSchema }), unsubscribe);
