export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  addresses?: string[];
  wishlist?: unknown[];
  wallet?: { balance: number; currency: string };
  notifications?: unknown[];
  recentlyViewed?: unknown[];
  supportTickets?: unknown[];
  reviews?: unknown[];
  isEmailVerified: boolean;
};
