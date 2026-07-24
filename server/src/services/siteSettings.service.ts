import { SiteSettingsModel } from '../models/SiteSettings.model.js';

// Singleton document — there is always exactly one SiteSettings row, created
// lazily on first read/write. Shared by the settings controller (admin
// read/write) and anything that needs current site-wide content at render
// time (email footer, invoice PDF header).
export function getOrCreateSiteSettings() {
  return SiteSettingsModel.findOneAndUpdate({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
}
