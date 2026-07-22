// Mirrors server/src/constants/pricing.ts — kept in sync by hand since the
// client only uses these for display/estimate purposes; the server always
// recalculates and is the source of truth for the charged amount.
//
// Product prices already include 5% GST, so TAX_RATE is only used for
// display copy ("GST (5%) Included in Product Price") and to correctly show
// historical orders placed before this policy — nothing computes a *new*
// additive tax from it going forward.
export const TAX_RATE = 0.05;
export const FREE_SHIPPING_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 50;
