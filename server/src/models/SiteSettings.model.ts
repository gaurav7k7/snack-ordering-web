import { Schema, model, type InferSchemaType } from 'mongoose';

export const DEFAULT_ANNOUNCEMENT_TEXT = '🚚 Free Delivery on Orders Above ₹499';
export const DEFAULT_B2B_CLIENTS_HEADING = 'Our B2B Clients';
export const DEFAULT_MEDIA_COVERAGE_HEADING = 'Media Coverage';

// Singleton document — there is always exactly one SiteSettings row, created
// lazily on first read/write via findOneAndUpdate(..., { upsert: true }).
const siteSettingsSchema = new Schema(
  {
    announcementText: { type: String, trim: true, maxlength: 200, default: DEFAULT_ANNOUNCEMENT_TEXT },
    b2bClientsHeading: { type: String, trim: true, maxlength: 120, default: DEFAULT_B2B_CLIENTS_HEADING },
    mediaCoverageHeading: { type: String, trim: true, maxlength: 120, default: DEFAULT_MEDIA_COVERAGE_HEADING },
  },
  { timestamps: true },
);

export type SiteSettings = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettingsModel = model('SiteSettings', siteSettingsSchema);
