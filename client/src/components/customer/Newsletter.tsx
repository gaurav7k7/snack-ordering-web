import { Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useSubscribeToNewsletterMutation } from '@/redux/api/newsletterApi';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribeToNewsletter, { isLoading }] = useSubscribeToNewsletterMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      const response = await subscribeToNewsletter({ email: trimmedEmail }).unwrap();
      toast.success(response.message || 'Subscribed! Check your inbox.');
      setEmail('');
    } catch {
      toast.error('Could not subscribe right now. Please try again.');
    }
  };

  return (
    <section className="bg-foreground py-14 text-background">
      <div className="container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
            Newsletter
          </p>
          <h2 className="mt-2 text-3xl font-bold">Get first access to drops and deals.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/75">
            Subscribe for seasonal launches, combo offers, and private tasting notes.
          </p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" aria-label="Newsletter signup" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-md border-0 bg-background pl-10 pr-3 text-foreground outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-secondary"
            />
          </div>
          <Button type="submit" variant="secondary" size="lg" disabled={isLoading}>
            {isLoading ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      </div>
    </section>
  );
}
