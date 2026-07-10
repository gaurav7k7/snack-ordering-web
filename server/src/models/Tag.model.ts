import { Schema, model, type InferSchemaType } from 'mongoose';

const tagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 40 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Tag = InferSchemaType<typeof tagSchema>;
export const TagModel = model('Tag', tagSchema);
