import { Router } from 'express';

import { getUploadSignature } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

export const uploadRoutes = Router();

// Any authenticated user can request a signature — customers upload review
// images, admins upload product images. Cloudinary's signature ties the
// upload to a fixed folder/timestamp so a signed request can't be reused
// for anything beyond what the server explicitly authorized.
uploadRoutes.get('/signature', authenticate, getUploadSignature);
