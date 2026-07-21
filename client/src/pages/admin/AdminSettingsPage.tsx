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

  const settings = data?.data?.settings;

  useEffect(() => {
    if (settings) setAnnouncementText(settings.announcementText);
  }, [settings]);

  const isDirty = settings ? announcementText !== settings.announcementText : false;

  const handleSave = async (event: React.FormEvent) => {
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

  const handleReset = () => {
    if (settings) setAnnouncementText(settings.announcementText);
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Site Settings | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage global site-wide content, starting with the homepage announcement bar.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold">Announcement bar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The scrolling message shown at the very top of every page. Keep it short — it scrolls continuously.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="mt-5 space-y-4">
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
              <Button type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" disabled={!isDirty} onClick={handleReset}>
                Reset / Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
