import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } from '@/redux/api/siteSettingsApi';
import type { CompanyInfo } from '@/types/siteSettings';
import { getErrorMessage } from '@/utils/getErrorMessage';

const EMPTY_COMPANY: CompanyInfo = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  email: '',
  cin: '',
  gstin: '',
  isoCertificationText: '',
  dataProtectionText: '',
};

const fieldClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary';

export default function AdminSettingsPage() {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSiteSettingsMutation();
  const [announcementText, setAnnouncementText] = useState('');
  const [b2bClientsHeading, setB2bClientsHeading] = useState('');
  const [mediaCoverageHeading, setMediaCoverageHeading] = useState('');
  const [galleryHeading, setGalleryHeading] = useState('');
  const [company, setCompany] = useState<CompanyInfo>(EMPTY_COMPANY);

  const settings = data?.data?.settings;

  useEffect(() => {
    if (settings) {
      setAnnouncementText(settings.announcementText);
      setB2bClientsHeading(settings.b2bClientsHeading);
      setMediaCoverageHeading(settings.mediaCoverageHeading);
      setGalleryHeading(settings.galleryHeading);
      setCompany(settings.company);
    }
  }, [settings]);

  const isAnnouncementDirty = settings ? announcementText !== settings.announcementText : false;
  const isHeadingsDirty = settings
    ? b2bClientsHeading !== settings.b2bClientsHeading ||
      mediaCoverageHeading !== settings.mediaCoverageHeading ||
      galleryHeading !== settings.galleryHeading
    : false;
  const isCompanyDirty = settings
    ? (Object.keys(EMPTY_COMPANY) as Array<keyof CompanyInfo>).some((key) => company[key] !== settings.company[key])
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
    if (!b2bClientsHeading.trim() || !mediaCoverageHeading.trim() || !galleryHeading.trim()) {
      toast.error('All headings are required.');
      return;
    }
    try {
      await updateSettings({
        b2bClientsHeading: b2bClientsHeading.trim(),
        mediaCoverageHeading: mediaCoverageHeading.trim(),
        galleryHeading: galleryHeading.trim(),
      }).unwrap();
      toast.success('Section headings updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update section headings.'));
    }
  };

  const handleSaveCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!company.name.trim()) {
      toast.error('Company name is required.');
      return;
    }
    if (!company.email.trim() || !/^\S+@\S+\.\S+$/.test(company.email.trim())) {
      toast.error('Enter a valid company email address.');
      return;
    }
    try {
      const trimmed = Object.fromEntries(
        Object.entries(company).map(([key, value]) => [key, value.trim()]),
      ) as CompanyInfo;
      await updateSettings({ company: trimmed }).unwrap();
      setCompany(trimmed);
      toast.success('Company information updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update company information.'));
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
                className={fieldClass}
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
          Titles shown above the logo carousels and photo gallery on the homepage. Manage the logos/photos
          themselves under <span className="font-semibold text-foreground">B2B Clients, Media Coverage & Gallery</span>{' '}
          in the sidebar.
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
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Media Coverage — heading</span>
              <input
                required
                maxLength={120}
                value={mediaCoverageHeading}
                onChange={(event) => setMediaCoverageHeading(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Fox Nut Processing gallery — heading</span>
              <input
                required
                maxLength={120}
                value={galleryHeading}
                onChange={(event) => setGalleryHeading(event.target.value)}
                className={fieldClass}
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
                  setGalleryHeading(settings.galleryHeading);
                }}
              >
                Reset / Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="max-w-2xl rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold">Company information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The single source of truth for your registered company details. Updating these fields automatically
          updates the Contact Us page, footer, order confirmation emails, invoices, and every other page that
          shows company information.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={handleSaveCompany} className="mt-5 space-y-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Company name</span>
              <input
                required
                maxLength={200}
                value={company.name}
                onChange={(event) => setCompany((current) => ({ ...current, name: event.target.value }))}
                placeholder="Lotus Delight"
                className={fieldClass}
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Corporate address — line 1</span>
              <input
                maxLength={200}
                value={company.addressLine1}
                onChange={(event) => setCompany((current) => ({ ...current, addressLine1: event.target.value }))}
                placeholder="Building, street"
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">
                Corporate address — line 2 <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <input
                maxLength={200}
                value={company.addressLine2}
                onChange={(event) => setCompany((current) => ({ ...current, addressLine2: event.target.value }))}
                placeholder="Area, landmark"
                className={fieldClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">City</span>
                <input
                  maxLength={100}
                  value={company.city}
                  onChange={(event) => setCompany((current) => ({ ...current, city: event.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">State</span>
                <input
                  maxLength={100}
                  value={company.state}
                  onChange={(event) => setCompany((current) => ({ ...current, state: event.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">PIN code</span>
                <input
                  maxLength={20}
                  value={company.postalCode}
                  onChange={(event) => setCompany((current) => ({ ...current, postalCode: event.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Country</span>
                <input
                  maxLength={100}
                  value={company.country}
                  onChange={(event) => setCompany((current) => ({ ...current, country: event.target.value }))}
                  placeholder="India"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Phone number</span>
                <input
                  required
                  maxLength={30}
                  value={company.phone}
                  onChange={(event) => setCompany((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+91 93415 02582"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Email address</span>
                <input
                  required
                  type="email"
                  maxLength={200}
                  value={company.email}
                  onChange={(event) => setCompany((current) => ({ ...current, email: event.target.value }))}
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">
                  CIN <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <input
                  maxLength={30}
                  value={company.cin}
                  onChange={(event) => setCompany((current) => ({ ...current, cin: event.target.value }))}
                  placeholder="U74999JH2017PTC010082"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">
                  GSTIN <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <input
                  maxLength={30}
                  value={company.gstin}
                  onChange={(event) => setCompany((current) => ({ ...current, gstin: event.target.value }))}
                  placeholder="09AAGCT2924B1ZK"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">ISO certification badge text</span>
                <input
                  maxLength={150}
                  value={company.isoCertificationText}
                  onChange={(event) =>
                    setCompany((current) => ({ ...current, isoCertificationText: event.target.value }))
                  }
                  placeholder="ISO 9001:2015 Certified Company"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold">Data protection badge text</span>
                <input
                  maxLength={150}
                  value={company.dataProtectionText}
                  onChange={(event) =>
                    setCompany((current) => ({ ...current, dataProtectionText: event.target.value }))
                  }
                  placeholder="Committed to Data Protection"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || !isCompanyDirty}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!isCompanyDirty}
                onClick={() => settings && setCompany(settings.company)}
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
