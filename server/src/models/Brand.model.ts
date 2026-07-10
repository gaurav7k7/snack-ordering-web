import { Schema, model, type InferSchemaType } from 'mongoose';

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 500 },
    logo: {
      url: String,
      publicId: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Brand = InferSchemaType<typeof brandSchema>;
export const BrandModel = model('Brand', brandSchema);
