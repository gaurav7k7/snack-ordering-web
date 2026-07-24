import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';

import { TrustBadges } from '@/components/shared/TrustBadges';
import { ROUTES } from '@/constants/routes';
import { SOCIAL_LINKS } from '@/constants/socialLinks';
import { useGetSiteSettingsQuery } from '@/redux/api/siteSettingsApi';

const SUPPORT_LINKS = [
  { label: 'Contact us', to: ROUTES.contact },
  { label: 'FAQs', to: ROUTES.faq },
  { label: 'Shipping policy', to: ROUTES.shippingPolicy },
  { label: 'Refund policy', to: ROUTES.refundPolicy },
];

const COMPANY_LINKS = [
  { label: 'About us', to: ROUTES.about },
  { label: 'Careers', to: ROUTES.careers },
  { label: 'Blog', to: ROUTES.blog },
  { label: 'Terms of service', to: ROUTES.terms },
  { label: 'Privacy policy', to: ROUTES.privacy },
];

const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]['label'], ComponentType<{ className?: string }>> = {
  Instagram,
  'Twitter / X': Twitter,
  Facebook,
  YouTube: Youtube,
};

const DEFAULT_PHONE = '+91 93415 02582';
const DEFAULT_EMAIL = 'Lotusdelightproducts@gmail.com';

export function SiteFooter() {
  const { data } = useGetSiteSettingsQuery();
  const company = data?.data?.settings?.company;

  const companyName = company?.name || 'Lotus Delight';
  const phone = company?.phone || DEFAULT_PHONE;
  const email = company?.email || DEFAULT_EMAIL;
  const addressLines = [company?.addressLine1, company?.addressLine2].filter(Boolean);
  const cityLine = [company?.city, company?.state].filter(Boolean).join(', ');
  const postalCountry = [company?.postalCode, company?.country].filter(Boolean).join(', ');
  const hasAddress = addressLines.length > 0 || Boolean(cityLine) || Boolean(postalCountry);
  const hasRegistrationDetails = Boolean(company?.cin) || Boolean(company?.gstin);

  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-8 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <h2 className="text-xl font-black">{companyName}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Premium snacks, secure checkout, quick fulfillment, and real support for every craving.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {email}
            </a>
          </div>

          {hasAddress ? (
            <div className="mt-5 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-semibold">Corporate Office</p>
                <p className="mt-0.5 text-muted-foreground">
                  {[...addressLines, cityLine, postalCountry].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, href }) => {
              const Icon = SOCIAL_ICONS[label];
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {hasRegistrationDetails || company?.isoCertificationText || company?.dataProtectionText ? (
        <div className="border-t bg-foreground text-background">
          <div className="container flex flex-col gap-6 py-8">
            {hasRegistrationDetails ? (
              <div>
                <p className="text-base font-bold text-secondary">{companyName}</p>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-background/70">
                  {company?.cin ? <span>CIN: {company.cin}</span> : null}
                  {company?.gstin ? <span>GSTIN: {company.gstin}</span> : null}
                </div>
              </div>
            ) : null}
            <TrustBadges
              isoText={company?.isoCertificationText ?? ''}
              dataProtectionText={company?.dataProtectionText ?? ''}
            />
          </div>
        </div>
      ) : null}

      <div className="border-t py-5">
        <div className="container flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.privacy} className="transition hover:text-primary">
              Privacy
            </Link>
            <Link to={ROUTES.terms} className="transition hover:text-primary">
              Terms
            </Link>
            <Link to={ROUTES.refundPolicy} className="transition hover:text-primary">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
