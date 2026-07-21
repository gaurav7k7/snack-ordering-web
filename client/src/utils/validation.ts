// Mirrors server/src/utils/validationPatterns.ts — keep both in sync.
export const PHONE_REGEX = /^\+?\d{7,15}$/;
export const POSTAL_CODE_REGEX = /^\d{4,10}$/;

/** Strips everything except digits (and a leading `+`) as the user types. */
export function sanitizePhoneInput(value: string): string {
  const hasLeadingPlus = value.trimStart().startsWith('+');
  const digits = value.replace(/\D/g, '');
  return hasLeadingPlus ? `+${digits}` : digits;
}

/** Strips everything except digits as the user types. */
export function sanitizeDigitsInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

export function isValidPostalCode(value: string): boolean {
  return POSTAL_CODE_REGEX.test(value);
}
