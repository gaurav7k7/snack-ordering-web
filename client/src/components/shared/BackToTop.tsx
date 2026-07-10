import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { COOKIE_CONSENT_ACCEPTED_EVENT, isCookieConsentAccepted } from '@/constants/cookieConsent';
import { cn } from '@/utils/cn';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCookieBannerShowing, setIsCookieBannerShowing] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsCookieBannerShowing(!isCookieConsentAccepted());

    const onAccepted = () => setIsCookieBannerShowing(false);
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted);

    return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      size="icon"
      className={cn(
        'fixed right-6 z-50 rounded-full shadow-lg transition-[bottom]',
        // The cookie banner sits at bottom-4 and can grow tall on narrow
        // screens (it stacks its text/button vertically) — clear it instead
        // of overlapping.
        isCookieBannerShowing ? 'bottom-24 sm:bottom-20' : 'bottom-6',
      )}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
