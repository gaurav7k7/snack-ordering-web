import { Schema, model, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 500 },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Category = InferSchemaType<typeof categorySchema>;
export const CategoryModel = model('Category', categorySchema);
