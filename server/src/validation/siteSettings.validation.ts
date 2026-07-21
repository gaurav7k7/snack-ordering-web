import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  announcementText: z.string().trim().min(1, 'Announcement text is required.').max(200),
});
