import { Schema, model, type InferSchemaType } from 'mongoose';

export const DEFAULT_ANNOUNCEMENT_TEXT = '🚚 Free Delivery on Orders Above ₹499';

// Singleton document — there is always exactly one SiteSettings row, created
// lazily on first read/write via findOneAndUpdate(..., { upsert: true }).
const siteSettingsSchema = new Schema(
  {
    announcementText: { type: String, trim: true, maxlength: 200, default: DEFAULT_ANNOUNCEMENT_TEXT },
  },
  { timestamps: true },
);

export type SiteSettings = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettingsModel = model('SiteSettings', siteSettingsSchema);
