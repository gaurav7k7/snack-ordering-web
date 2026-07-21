export const COOKIE_CONSENT_KEY = 'lotusdelight-cookie-consent';
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'lotusdelight:cookie-consent-accepted';

export function isCookieConsentAccepted() {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}
