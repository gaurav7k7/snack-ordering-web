import { Schema, model, type InferSchemaType } from 'mongoose';

// One shared model backs three distinct homepage sections ("Our B2B
// Clients", "Media Coverage", and the "Fox Nut Processing" photo gallery) —
// they're structurally identical (an image, an optional link, display
// order, active state), so a `category` discriminator avoids duplicating an
// entire model/controller/admin-page pair for what would otherwise be
// near-identical entities. `name` doubles as the gallery photos' internal
// label/alt-text fallback.
export const PARTNER_LOGO_CATEGORIES = ['b2b_client', 'media_coverage', 'gallery'] as const;

const partnerLogoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    logo: {
      url: { type: String, required: true },
      publicId: String,
      alt: String,
    },
    link: { type: String, trim: true, maxlength: 300 },
    category: { type: String, enum: PARTNER_LOGO_CATEGORIES, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type PartnerLogo = InferSchemaType<typeof partnerLogoSchema>;
export const PartnerLogoModel = model('PartnerLogo', partnerLogoSchema);
