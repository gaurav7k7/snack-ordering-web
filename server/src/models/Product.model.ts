import { Schema, model, type InferSchemaType } from 'mongoose';

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, required: true, trim: true, maxlength: 160 },
  },
  { _id: false },
);

const nutritionFactsSchema = new Schema(
  {
    servingSize: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: String, required: true, trim: true },
    carbs: { type: String, required: true, trim: true },
    fat: { type: String, required: true, trim: true },
    sugar: { type: String, required: true, trim: true },
    sodium: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    ingredients: [{ type: String, required: true, trim: true }],
    weight: { type: String, required: true, trim: true },
    nutritionFacts: { type: nutritionFactsSchema, required: true },
    mrp: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, max: 100, default: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    images: { type: [productImageSchema], validate: [(images: unknown[]) => images.length > 0, 'At least one image is required.'] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: String, required: true, trim: true, maxlength: 80 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    availableQuantity: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, maxlength: 80 },
    tags: [{ type: String, lowercase: true, trim: true }],
    ratings: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: [productReviewSchema], default: [] },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    recommendedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    deliveryEstimate: { type: String, required: true, trim: true, maxlength: 160 },
    returnPolicy: { type: String, required: true, trim: true, maxlength: 500 },
    shippingInformation: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, subCategory: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isTrending: 1, isBestSeller: 1 });

export type Product = InferSchemaType<typeof productSchema>;
export const ProductModel = model('Product', productSchema);
