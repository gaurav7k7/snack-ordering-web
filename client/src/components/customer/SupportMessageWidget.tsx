import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Mail, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useFloatingActionOffset } from '@/hooks/useFloatingActionOffset';
import { useSubmitContactMessageMutation } from '@/redux/api/contactApi';
import { useGetSiteSettingsQuery } from '@/redux/api/siteSettingsApi';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { isValidPhone, sanitizePhoneInput } from '@/utils/validation';

const GREETING =
  "Hey there! 👋 Our team isn't live right now, but drop us a message below and we'll reply by email — usually within 1-2 business days.";

const inputClass =
  'h-9 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/40';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };
const DEFAULT_PHONE = '+91 93415 02582';
const DEFAULT_EMAIL = 'Lotusdelightproducts@gmail.com';

export function SupportMessageWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const bottomOffset = useFloatingActionOffset();
  const [submitMessage, { isLoading }] = useSubmitContactMessageMutation();
  const { data: settingsData } = useGetSiteSettingsQuery();
  const company = settingsData?.data?.settings?.company;
  const phone = company?.phone || DEFAULT_PHONE;
  const email = company?.email || DEFAULT_EMAIL;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    if (form.phone.trim() && !isValidPhone(form.phone.trim())) {
      toast.error('Enter a valid phone number (digits only, optional leading +).');
      return;
    }

    try {
      await submitMessage(form).unwrap();
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to send your message. Please try again.'));
    }
  };

  return (
    <div className="fixed left-6 z-40 transition-[bottom]" style={{ bottom: bottomOffset }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 left-0 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border bg-card text-card-foreground shadow-soft-lg sm:w-96"
          >
            <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-primary-foreground">
              <p className="text-sm font-bold">Lotus Delight Support</p>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close support form">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <p className="rounded-xl bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">{GREETING}</p>

              {sent ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Thanks — your message has been received. We&apos;ll get back to you at your email shortly.
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className={inputClass}
                  />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Your email"
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: sanitizePhoneInput(event.target.value) }))
                    }
                    placeholder="Phone (optional)"
                    className={inputClass}
                  />
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={3}
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    placeholder="How can we help?"
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                    <Send className="mr-2 h-3.5 w-3.5" />
                    {isLoading ? 'Sending…' : 'Send message'}
                  </Button>
                </form>
              )}

              <div className="flex flex-col gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Phone className="h-3 w-3" /> {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Mail className="h-3 w-3" /> {email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        size="icon"
        className={cn('h-12 w-12 rounded-full shadow-soft-lg', isOpen && 'bg-muted text-foreground hover:bg-muted')}
        aria-label={isOpen ? 'Close support form' : 'Open support form'}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSent(false);
        }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </div>
  );
}
