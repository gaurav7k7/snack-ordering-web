import { Router } from 'express';

import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', authenticate, authorize('admin'), getDashboard);
