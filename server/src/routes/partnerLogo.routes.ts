import { Router } from 'express';

import {
  createPartnerLogo,
  deletePartnerLogo,
  listPartnerLogos,
  updatePartnerLogo,
} from '../controllers/partnerLogo.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createPartnerLogoSchema, updatePartnerLogoSchema } from '../validation/partnerLogo.validation.js';

export const partnerLogoRoutes = Router();

partnerLogoRoutes.get('/', listPartnerLogos);
partnerLogoRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: createPartnerLogoSchema }),
  createPartnerLogo,
);
partnerLogoRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updatePartnerLogoSchema }),
  updatePartnerLogo,
);
partnerLogoRoutes.delete('/:id', authenticate, authorize('admin'), deletePartnerLogo);
