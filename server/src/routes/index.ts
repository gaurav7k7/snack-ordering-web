import { Router } from 'express';

import { authRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';
import { orderRoutes } from './order.routes.js';
import { productRoutes } from './product.routes.js';
import { profileRoutes } from './profile.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/profile', profileRoutes);
apiRoutes.use('/orders', orderRoutes);
