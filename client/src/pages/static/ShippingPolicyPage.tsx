import { StaticPageLayout } from '@/components/shared/StaticPageLayout';

export default function ShippingPolicyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Shipping Policy"
      description="Delivery timelines, shipping fees, and coverage for SnackCo orders across India."
      breadcrumbLabel="Shipping Policy"
    >
      <p>Last updated: January 2026</p>

      <h2>1. Delivery timelines</h2>
      <p>
        Most orders are dispatched within 24 hours of confirmation and arrive within <strong>2-4 business days</strong>{' '}
        depending on your location. Metro cities are typically on the faster end; remote pin codes may take a
        little longer. An estimated delivery window is shown at checkout before you pay.
      </p>

      <h2>2. Shipping fees</h2>
      <p>
        Orders above <strong>₹999</strong> ship free. Orders below that threshold have a flat{' '}
        <strong>₹69</strong> shipping fee, calculated automatically at checkout.
      </p>

      <h2>3. Order tracking</h2>
      <p>
        Once your order ships, tracking information appears on your Order Details page and is emailed to you
        automatically. You can also see live status updates (packed, shipped, out for delivery, delivered) from
        your Orders page.
      </p>

      <h2>4. Packaging</h2>
      <p>
        All snacks are sealed in tamper-evident packaging with extra cushioning for fragile items like chips and
        popcorn, so they arrive as crisp as they left our facility.
      </p>

      <h2>5. Delivery issues</h2>
      <p>
        If a package is delayed beyond the estimated window, arrives damaged, or shows as "delivered" but you never
        received it, contact us within 48 hours via the Contact page with your order number and we'll investigate
        with the courier immediately.
      </p>

      <h2>6. Serviceable areas</h2>
      <p>
        We currently ship across India to most serviceable pin codes. If your pin code isn't covered, checkout will
        let you know before you complete payment.
      </p>
    </StaticPageLayout>
  );
}
