import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useSubmitContactMessageMutation } from '@/redux/api/contactApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

const inputClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary';

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Email', value: 'support@lotusdelight.co.in', href: 'mailto:support@lotusdelight.co.in' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: MapPin, label: 'Address', value: 'Andheri East, Mumbai, Maharashtra, India' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitMessage, { isLoading }] = useSubmitContactMessageMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await submitMessage(form).unwrap();
      toast.success("Message sent — we'll get back to you within 1-2 business days.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to send your message. Please try again.'));
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Lotus Delight</title>
        <meta name="description" content="Get in touch with the Lotus Delight team for order help, bulk orders, or partnership questions." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Contact us' }]} />

      <section className="container grid gap-10 pb-16 pt-2 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="bg-gradient-brand bg-clip-text text-xs font-bold uppercase tracking-[0.22em] text-transparent">
            Get in touch
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">We'd love to hear from you</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Questions about an order, a bulk/corporate gifting request, or feedback on a flavor? Send us a message
            and a real person will reply.
          </p>

          <div className="mt-8 space-y-4">
            {CONTACT_DETAILS.map((detail) => (
              <div key={detail.label} className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <detail.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a href={detail.href} className="text-sm font-semibold hover:text-primary">
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold">{detail.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Name</span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={inputClass}
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Subject</span>
            <input
              required
              minLength={3}
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Order help, bulk order, partnership…"
              className={inputClass}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Message</span>
            <textarea
              required
              minLength={10}
              rows={6}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className={inputClass}
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </section>
    </>
  );
}
