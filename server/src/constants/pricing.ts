// Product prices already include 5% GST (set by the admin when pricing each
// product) — the customer-facing UI shows no tax breakdown at all. This is
// kept only to correctly show the real, additive tax amount that was
// actually charged on historical orders placed before this policy.
// Nothing computes a *new* additive tax from this going forward.
export const TAX_RATE = 0.05;

// Orders at or above this subtotal ship free; below it, STANDARD_SHIPPING_FEE applies.
export const FREE_SHIPPING_THRESHOLD = 499;
export const STANDARD_SHIPPING_FEE = 50;

export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_CURRENCY = 'INR';
