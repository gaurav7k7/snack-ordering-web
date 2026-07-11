import { StaticPageLayout } from '@/components/shared/StaticPageLayout';

export default function RefundPolicyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Refund & Return Policy"
      description="Our 7-day return window, refund timelines, and how to request a return on SnackCo."
      breadcrumbLabel="Refund Policy"
    >
      <p>Last updated: January 2026</p>

      <h2>1. Return eligibility</h2>
      <p>
        Delivered orders can be returned within <strong>7 days</strong> of delivery if the product is unopened, or
        if it arrived damaged, defective, or different from what you ordered. Perishable/food items that have been
        opened cannot be returned unless there's a genuine quality issue — send us a photo via the Contact page and
        we'll make it right.
      </p>

      <h2>2. How to request a return</h2>
      <p>
        Go to <strong>Orders → Order Details</strong> and select "Request return" on an eligible order, or contact
        support with your order number. We review each request within 24-48 hours.
      </p>

      <h2>3. Cancellations</h2>
      <p>
        Orders can be cancelled free of charge any time before they're packed for shipping. Once packed or shipped,
        the order follows the standard return process instead.
      </p>

      <h2>4. Refund timeline</h2>
      <p>
        Once a return or cancellation is approved, refunds for online payments (UPI, cards, wallets) are issued to
        your original payment method via Razorpay and typically reflect within <strong>5-7 business days</strong>,
        depending on your bank. Cash-on-delivery orders are refunded via bank transfer or store credit.
      </p>

      <h2>5. Non-refundable situations</h2>
      <ul>
        <li>Change of mind after a food item has been opened and consumed.</li>
        <li>Requests made outside the 7-day window without a quality issue.</li>
        <li>Orders confirmed as delivered to the correct address per courier tracking, where the item is reported "not received" without a police complaint or courier investigation.</li>
      </ul>

      <h2>6. Questions</h2>
      <p>
        If a refund hasn't arrived within the stated window, reach out via the Contact page with your order number
        and we'll investigate right away.
      </p>
    </StaticPageLayout>
  );
}
