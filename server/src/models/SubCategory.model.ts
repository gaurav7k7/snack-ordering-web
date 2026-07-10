import { Schema, model, type InferSchemaType } from 'mongoose';

const subCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

subCategorySchema.index({ category: 1, name: 1 }, { unique: true });

export type SubCategory = InferSchemaType<typeof subCategorySchema>;
export const SubCategoryModel = model('SubCategory', subCategorySchema);
