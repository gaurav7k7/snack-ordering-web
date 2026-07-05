export const USER_ROLES = {
  customer: 'customer',
  admin: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
