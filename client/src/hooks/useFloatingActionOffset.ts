import { useEffect, useState } from 'react';

import { COOKIE_CONSENT_ACCEPTED_EVENT, isCookieConsentAccepted } from '@/constants/cookieConsent';
import { useAppSelector } from '@/hooks/redux';

const BASE_GAP_PX = 24; // matches Tailwind's bottom-6, the resting offset with nothing else docked
const COOKIE_BANNER_RESERVE_PX = 96; // approximate footprint of the cookie consent card + its own bottom-4 gap

// Shared by every fixed, bottom-anchored action button (Back-to-top, Live
// Chat) so they consistently clear whatever full-width bar(s) are currently
// docked to the bottom of the screen — the compare tray, the sticky
// add-to-cart bar, both at once, or neither — plus the cookie consent card.
// Returns the pixel value to use as the element's `bottom` style.
export function useFloatingActionOffset() {
  const barHeights = useAppSelector((state) => state.floatingBars.heights);
  const [isCookieBannerShowing, setIsCookieBannerShowing] = useState(false);

  useEffect(() => {
    setIsCookieBannerShowing(!isCookieConsentAccepted());

    const onAccepted = () => setIsCookieBannerShowing(false);
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted);
    return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted);
  }, []);

  const dockedBarsHeight = Object.values(barHeights).reduce((total, height) => total + height, 0);
  const cookieReserve = isCookieBannerShowing ? COOKIE_BANNER_RESERVE_PX : 0;

  return BASE_GAP_PX + dockedBarsHeight + cookieReserve;
}
