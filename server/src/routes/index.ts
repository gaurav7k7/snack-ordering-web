import { Router } from 'express';

import { adminNewsletterRoutes } from './adminNewsletter.routes.js';
import { adminUserRoutes } from './adminUser.routes.js';
import { authRoutes } from './auth.routes.js';
import { brandRoutes } from './brand.routes.js';
import { categoryRoutes } from './category.routes.js';
import { contactRoutes } from './contact.routes.js';
import { couponRoutes } from './coupon.routes.js';
import { dashboardRoutes } from './dashboard.routes.js';
import { healthRoutes } from './health.routes.js';
import { newsletterRoutes } from './newsletter.routes.js';
import { orderRoutes } from './order.routes.js';
import { productRoutes } from './product.routes.js';
import { profileRoutes } from './profile.routes.js';
import { reviewAdminRoutes } from './reviewAdmin.routes.js';
import { subCategoryRoutes } from './subCategory.routes.js';
import { tagRoutes } from './tag.routes.js';
import { uploadRoutes } from './upload.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/subcategories', subCategoryRoutes);
apiRoutes.use('/brands', brandRoutes);
apiRoutes.use('/tags', tagRoutes);
apiRoutes.use('/profile', profileRoutes);
apiRoutes.use('/orders', orderRoutes);
apiRoutes.use('/coupons', couponRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/uploads', uploadRoutes);
apiRoutes.use('/users', adminUserRoutes);
apiRoutes.use('/admin/reviews', reviewAdminRoutes);
apiRoutes.use('/admin/newsletter', adminNewsletterRoutes);
apiRoutes.use('/newsletter', newsletterRoutes);
apiRoutes.use('/contact', contactRoutes);
