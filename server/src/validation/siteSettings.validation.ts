import { z } from 'zod';

// All optional + partial: the admin form saves whichever company fields it
// holds, and callers may send only a subset (e.g. just the phone number).
const companySchema = z
  .object({
    name: z.string().trim().max(200),
    addressLine1: z.string().trim().max(200),
    addressLine2: z.string().trim().max(200),
    city: z.string().trim().max(100),
    state: z.string().trim().max(100),
    postalCode: z.string().trim().max(20),
    country: z.string().trim().max(100),
    phone: z.string().trim().max(30),
    email: z.string().trim().max(200).email('Enter a valid email address.'),
    cin: z.string().trim().max(30),
    gstin: z.string().trim().max(30),
    isoCertificationText: z.string().trim().max(150),
    dataProtectionText: z.string().trim().max(150),
  })
  .partial();

export const updateSiteSettingsSchema = z.object({
  announcementText: z.string().trim().min(1, 'Announcement text is required.').max(200).optional(),
  b2bClientsHeading: z.string().trim().min(1, 'Heading is required.').max(120).optional(),
  mediaCoverageHeading: z.string().trim().min(1, 'Heading is required.').max(120).optional(),
  galleryHeading: z.string().trim().min(1, 'Heading is required.').max(120).optional(),
  company: companySchema.optional(),
});
