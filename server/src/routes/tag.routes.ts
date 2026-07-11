import { Router } from 'express';

import { createTag, deleteTag, listTags, updateTag } from '../controllers/tag.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createTagSchema, updateTagSchema } from '../validation/taxonomy.validation.js';

export const tagRoutes = Router();

tagRoutes.get('/', listTags);
tagRoutes.post('/', authenticate, authorize('admin'), validateRequest({ body: createTagSchema }), createTag);
tagRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateTagSchema }),
  updateTag,
);
tagRoutes.delete('/:id', authenticate, authorize('admin'), deleteTag);
