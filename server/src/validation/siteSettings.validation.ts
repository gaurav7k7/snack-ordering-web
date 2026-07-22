import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  announcementText: z.string().trim().min(1, 'Announcement text is required.').max(200).optional(),
  b2bClientsHeading: z.string().trim().min(1, 'Heading is required.').max(120).optional(),
  mediaCoverageHeading: z.string().trim().min(1, 'Heading is required.').max(120).optional(),
});
