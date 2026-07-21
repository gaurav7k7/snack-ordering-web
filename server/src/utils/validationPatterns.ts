// Shared across contact/profile/order validation schemas so phone and postal
// code formats stay consistent everywhere they're accepted.
export const PHONE_REGEX = /^\+?\d{7,15}$/;
export const PHONE_INVALID_MESSAGE = 'Enter a valid phone number (digits only, optional leading +).';

export const POSTAL_CODE_REGEX = /^\d{4,10}$/;
export const POSTAL_CODE_INVALID_MESSAGE = 'Enter a valid postal code (numbers only).';
