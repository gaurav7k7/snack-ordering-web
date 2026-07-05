import { ProductModel } from '../models/Product.model.js';

export function findActiveProducts() {
  return ProductModel.find({ isActive: true }).sort({ createdAt: -1 });
}
