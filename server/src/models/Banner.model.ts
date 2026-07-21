import { Schema, model, type InferSchemaType } from 'mongoose';

const bannerSchema = new Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 120 },
    subheading: { type: String, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300 },
    buttonText: { type: String, trim: true, maxlength: 40 },
    buttonLink: { type: String, trim: true, maxlength: 300 },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Banner = InferSchemaType<typeof bannerSchema>;
export const BannerModel = model('Banner', bannerSchema);
