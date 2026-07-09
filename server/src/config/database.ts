import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from '../utils/logger.js';
import '../models/Category.model.js';
import '../models/Order.model.js';
import '../models/Product.model.js';
import '../models/User.model.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri);
  logger.info('MongoDB connected');
}
