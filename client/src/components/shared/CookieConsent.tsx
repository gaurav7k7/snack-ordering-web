import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_KEY,
  isCookieConsentAccepted,
} from '@/constants/cookieConsent';

export function CookieConsent() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(!isCookieConsentAccepted());
  }, []);

  if (!shouldShow) return null;

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShouldShow(false);
    window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT));
  };

  return (
    <section className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border bg-card p-4 shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          We use cookies to keep your cart, preferences, and checkout experience running smoothly.
        </p>
        <Button size="sm" onClick={acceptCookies}>
          Accept
        </Button>
      </div>
    </section>
  );
}
