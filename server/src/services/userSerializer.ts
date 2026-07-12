type UserLike = {
  _id?: { toString(): string } | string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  avatar?: string | null;
  isEmailVerified?: boolean;
  addresses?: unknown[];
  wishlist?: unknown[];
  coupons?: unknown[];
  wallet?: { balance: number; currency: string };
  notifications?: unknown[];
  recentlyViewed?: unknown[];
  supportTickets?: unknown[];
  reviews?: unknown[];
};

/** The minimal shape returned by auth endpoints (login/register/me). */
export function toUserSummary(user: UserLike) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };
}

/** The fuller shape returned by the profile endpoint — extends the auth summary. */
export function toUserProfile(user: UserLike) {
  return {
    ...toUserSummary(user),
    addresses: user.addresses ?? [],
    wishlist: user.wishlist ?? [],
    coupons: user.coupons ?? [],
    wallet: user.wallet ?? { balance: 0, currency: 'INR' },
    notifications: user.notifications ?? [],
    recentlyViewed: user.recentlyViewed ?? [],
    supportTickets: user.supportTickets ?? [],
    reviews: user.reviews ?? [],
  };
}
