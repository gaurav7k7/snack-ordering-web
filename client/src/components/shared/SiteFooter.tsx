import { Facebook, Instagram, Mail, Phone, Twitter, Youtube } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { SOCIAL_LINKS } from '@/constants/socialLinks';

const SHOP_LINKS = [
  { label: 'All snacks', to: ROUTES.products },
  { label: 'Best sellers', to: `${ROUTES.products}?sort=best_selling` },
  { label: 'New arrivals', to: `${ROUTES.products}?sort=newest` },
  { label: 'Top rated', to: `${ROUTES.products}?sort=highest_rated` },
  { label: 'Wishlist', to: ROUTES.wishlist },
];

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

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-8 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <h2 className="text-xl font-black">Lotus Delight</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Premium snacks, secure checkout, quick fulfillment, and real support for every craving.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href="tel:+919341502582"
              className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              +91 93415 02582
            </a>
            <a
              href="mailto:Lotusdelightproducts@gmail.com"
              className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Lotusdelightproducts@gmail.com
            </a>
          </div>
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
          <h3 className="font-semibold">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
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
      <div className="border-t py-5">
        <div className="container flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Lotus Delight. All rights reserved.</span>
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
