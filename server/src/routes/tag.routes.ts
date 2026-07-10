import { Router } from 'express';

import { createTag, deleteTag, listTags, updateTag } from '../controllers/tag.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const tagRoutes = Router();

tagRoutes.get('/', listTags);
tagRoutes.post('/', authenticate, authorize('admin'), createTag);
tagRoutes.patch('/:id', authenticate, authorize('admin'), updateTag);
tagRoutes.delete('/:id', authenticate, authorize('admin'), deleteTag);
