import { Schema, model, type InferSchemaType } from 'mongoose';

export const DEFAULT_ANNOUNCEMENT_TEXT = '🚚 Free Delivery on Orders Above ₹499';
export const DEFAULT_B2B_CLIENTS_HEADING = 'Our B2B Clients';
export const DEFAULT_MEDIA_COVERAGE_HEADING = 'Media Coverage';
export const DEFAULT_GALLERY_HEADING = 'Fox Nut Processing';

// Seeded from what used to be hardcoded in the footer/contact page/emails —
// kept as real defaults (not empty strings) so nothing goes blank the moment
// this field set ships, before an admin has visited Company Information.
const DEFAULT_COMPANY = {
  name: 'Lotus Delight',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '+91 93415 02582',
  email: 'Lotusdelightproducts@gmail.com',
  cin: '',
  gstin: '',
  isoCertificationText: 'ISO 9001:2015 Certified Company',
  dataProtectionText: 'Committed to Data Protection',
};

// Nested (not a separate collection) — it's one company, always edited and
// read as a unit alongside the rest of the site-wide settings singleton.
const companySchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 200, default: DEFAULT_COMPANY.name },
    addressLine1: { type: String, trim: true, maxlength: 200, default: DEFAULT_COMPANY.addressLine1 },
    addressLine2: { type: String, trim: true, maxlength: 200, default: DEFAULT_COMPANY.addressLine2 },
    city: { type: String, trim: true, maxlength: 100, default: DEFAULT_COMPANY.city },
    state: { type: String, trim: true, maxlength: 100, default: DEFAULT_COMPANY.state },
    postalCode: { type: String, trim: true, maxlength: 20, default: DEFAULT_COMPANY.postalCode },
    country: { type: String, trim: true, maxlength: 100, default: DEFAULT_COMPANY.country },
    phone: { type: String, trim: true, maxlength: 30, default: DEFAULT_COMPANY.phone },
    email: { type: String, trim: true, maxlength: 200, default: DEFAULT_COMPANY.email },
    cin: { type: String, trim: true, maxlength: 30, default: DEFAULT_COMPANY.cin },
    gstin: { type: String, trim: true, maxlength: 30, default: DEFAULT_COMPANY.gstin },
    isoCertificationText: { type: String, trim: true, maxlength: 150, default: DEFAULT_COMPANY.isoCertificationText },
    dataProtectionText: { type: String, trim: true, maxlength: 150, default: DEFAULT_COMPANY.dataProtectionText },
  },
  { _id: false },
);

// Singleton document — there is always exactly one SiteSettings row, created
// lazily on first read/write via findOneAndUpdate(..., { upsert: true }).
const siteSettingsSchema = new Schema(
  {
    announcementText: { type: String, trim: true, maxlength: 200, default: DEFAULT_ANNOUNCEMENT_TEXT },
    b2bClientsHeading: { type: String, trim: true, maxlength: 120, default: DEFAULT_B2B_CLIENTS_HEADING },
    mediaCoverageHeading: { type: String, trim: true, maxlength: 120, default: DEFAULT_MEDIA_COVERAGE_HEADING },
    galleryHeading: { type: String, trim: true, maxlength: 120, default: DEFAULT_GALLERY_HEADING },
    company: { type: companySchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type SiteSettings = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettingsModel = model('SiteSettings', siteSettingsSchema);
