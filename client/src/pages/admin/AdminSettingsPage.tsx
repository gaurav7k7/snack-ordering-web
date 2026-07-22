import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/redux/api/siteSettingsApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function AdminSettingsPage() {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSiteSettingsMutation();
  const [announcementText, setAnnouncementText] = useState('');
  const [b2bClientsHeading, setB2bClientsHeading] = useState('');
  const [mediaCoverageHeading, setMediaCoverageHeading] = useState('');

  const settings = data?.data?.settings;

  useEffect(() => {
    if (settings) {
      setAnnouncementText(settings.announcementText);
      setB2bClientsHeading(settings.b2bClientsHeading);
      setMediaCoverageHeading(settings.mediaCoverageHeading);
    }
  }, [settings]);

  const isAnnouncementDirty = settings ? announcementText !== settings.announcementText : false;
  const isHeadingsDirty = settings
    ? b2bClientsHeading !== settings.b2bClientsHeading || mediaCoverageHeading !== settings.mediaCoverageHeading
    : false;

  const handleSaveAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!announcementText.trim()) {
      toast.error('Announcement text is required.');
      return;
    }
    try {
      await updateSettings({ announcementText: announcementText.trim() }).unwrap();
      toast.success('Announcement bar updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update announcement bar.'));
    }
  };

  const handleSaveHeadings = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!b2bClientsHeading.trim() || !mediaCoverageHeading.trim()) {
      toast.error('Both headings are required.');
      return;
    }
    try {
      await updateSettings({
        b2bClientsHeading: b2bClientsHeading.trim(),
        mediaCoverageHeading: mediaCoverageHeading.trim(),
      }).unwrap();
      toast.success('Section headings updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update section headings.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Site Settings | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage global site-wide content.</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold">Announcement bar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The scrolling message shown at the very top of every page. Keep it short — it scrolls continuously.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={handleSaveAnnouncement} className="mt-5 space-y-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Announcement text</span>
              <input
                required
                maxLength={200}
                value={announcementText}
                onChange={(event) => setAnnouncementText(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="🚚 Free Delivery on Orders Above ₹499"
              />
              <span className="text-xs text-muted-foreground">{announcementText.length}/200 characters</span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || !isAnnouncementDirty}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!isAnnouncementDirty}
                onClick={() => settings && setAnnouncementText(settings.announcementText)}
              >
                Reset / Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold">Homepage section headings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Titles shown above the logo carousels at the bottom of the homepage. Manage the logos themselves under{' '}
          <span className="font-semibold text-foreground">B2B Clients</span> and{' '}
          <span className="font-semibold text-foreground">Media Coverage</span> in the sidebar.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={handleSaveHeadings} className="mt-5 space-y-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Our B2B Clients — heading</span>
              <input
                required
                maxLength={120}
                value={b2bClientsHeading}
                onChange={(event) => setB2bClientsHeading(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Media Coverage — heading</span>
              <input
                required
                maxLength={120}
                value={mediaCoverageHeading}
                onChange={(event) => setMediaCoverageHeading(event.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
              />
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || !isHeadingsDirty}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!isHeadingsDirty}
                onClick={() => {
                  if (!settings) return;
                  setB2bClientsHeading(settings.b2bClientsHeading);
                  setMediaCoverageHeading(settings.mediaCoverageHeading);
                }}
              >
                Reset / Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
