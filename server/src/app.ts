import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import passport from 'passport';
import './config/passport.js';

import { env } from './config/env.js';
import { handleRazorpayWebhook } from './controllers/order.controller.js';
import { csrfProtection } from './middleware/csrfMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { apiRoutes } from './routes/index.js';

export const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(compression());
app.post(
  '/api/v1/orders/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook,
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser(env.cookieSecret));
app.use(csrfProtection);
app.use(passport.initialize());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/api/v1', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
