export const COOKIE_CONSENT_KEY = 'snackco-cookie-consent';
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'snackco:cookie-consent-accepted';

export function isCookieConsentAccepted() {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}
