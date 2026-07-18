import { ChevronDown } from 'lucide-react';

import { StaticPageLayout } from '@/components/shared/StaticPageLayout';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '@/constants/pricing';

const FAQ_GROUPS = [
  {
    heading: 'Orders & payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, credit/debit cards, net banking, and popular wallets via Razorpay, as well as cash on delivery for eligible pin codes.',
      },
      {
        q: 'Can I change or cancel my order after placing it?',
        a: 'Orders can be cancelled from the Orders page as long as they haven\'t shipped yet. Once packed, cancellation may not be possible — contact us and we\'ll try our best.',
      },
      {
        q: 'Do you offer bulk or corporate gifting orders?',
        a: 'Yes — reach out via the Contact page with your quantity and timeline and our team will put together a custom quote.',
      },
    ],
  },
  {
    heading: 'Shipping & delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Most orders arrive within 2-4 business days. Remote pin codes may take a little longer — you\'ll see an estimate at checkout.',
      },
      {
        q: 'Is shipping free?',
        a: `Orders above ₹${FREE_SHIPPING_THRESHOLD} ship free. Below that, a flat ₹${STANDARD_SHIPPING_FEE} shipping fee applies.`,
      },
      {
        q: 'How do I track my order?',
        a: 'Once shipped, tracking details appear on your Order Details page and are emailed to you automatically.',
      },
    ],
  },
  {
    heading: 'Returns & refunds',
    items: [
      {
        q: 'What is your return window?',
        a: 'Delivered orders are eligible for a return request within 7 days if the product is unopened or defective — see our Refund Policy for full details.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Once a return is approved, refunds are processed to your original payment method within 5-7 business days.',
      },
    ],
  },
  {
    heading: 'Product & quality',
    items: [
      {
        q: 'Are your snacks preservative-free?',
        a: 'Most of our house-made batches use no artificial preservatives. Ingredient lists and nutrition facts are listed on every product page.',
      },
      {
        q: 'How do I report a quality issue?',
        a: 'Message us via the Contact page with your order number and a photo — we\'ll replace or refund it, no questions asked.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <StaticPageLayout
      eyebrow="Support"
      title="Frequently asked questions"
      description="Answers to common questions about orders, shipping, returns, and product quality at Lotus Delight."
      breadcrumbLabel="FAQ"
    >
      <div className="space-y-8">
        {FAQ_GROUPS.map((group) => (
          <div key={group.heading}>
            <h2>{group.heading}</h2>
            <div className="space-y-2">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-border/70 bg-card px-4 py-3 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
}
