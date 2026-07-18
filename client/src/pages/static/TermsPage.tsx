import { StaticPageLayout } from '@/components/shared/StaticPageLayout';

export default function TermsPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      description="The terms that govern your use of Lotus Delight and any orders placed through it."
      breadcrumbLabel="Terms of Service"
    >
      <p>Last updated: January 2026</p>

      <h2>1. Acceptance of terms</h2>
      <p>
        By creating an account or placing an order on Lotus Delight, you agree to these terms. If you don't agree, please
        don't use the site.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You're responsible for keeping your login credentials secure and for all activity under your account.
        Accounts found engaging in fraud, abuse of coupons/promotions, or repeated chargebacks may be suspended.
      </p>

      <h2>3. Orders & pricing</h2>
      <p>
        Prices are shown in INR and include applicable taxes unless stated otherwise. We reserve the right to
        cancel an order (with a full refund) if a listing error, stock shortage, or suspected fraud is discovered
        after the order is placed.
      </p>

      <h2>4. Coupons & promotions</h2>
      <p>
        Coupons are subject to their stated validity window, minimum order value, and per-customer usage limits.
        We may modify or discontinue a promotion at any time without notice, though this won't affect orders
        already placed under it.
      </p>

      <h2>5. Reviews & user content</h2>
      <p>
        Reviews and images you submit must be your own genuine experience with the product. We may moderate or
        remove content that is abusive, fake, or violates these terms. Verified-purchase badges are only shown when
        we can confirm the reviewer actually bought the item.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        Lotus Delight is not liable for indirect or consequential damages arising from use of the site, to the maximum
        extent permitted by law. Our total liability for any claim is limited to the amount you paid for the order
        in question.
      </p>

      <h2>7. Changes to these terms</h2>
      <p>
        We may update these terms as the platform evolves. Continued use of the site after changes are posted
        constitutes acceptance of the updated terms.
      </p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of India, with courts in Mumbai, Maharashtra having exclusive jurisdiction.</p>
    </StaticPageLayout>
  );
}
