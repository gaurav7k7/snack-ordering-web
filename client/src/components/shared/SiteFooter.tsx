export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-8 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <h2 className="text-xl font-black">SnackCo</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Premium snacks, secure checkout, quick fulfillment, and real support for every craving.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Popcorn</li>
            <li>Chips</li>
            <li>Trail Mix</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Shipping</li>
            <li>Returns</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Secure</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Razorpay-ready checkout, protected accounts, and encrypted delivery details.
          </p>
        </div>
      </div>
      <div className="border-t py-5">
        <div className="container flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>(c) 2026 SnackCo. All rights reserved.</span>
          <span>Privacy | Terms | Cookies</span>
        </div>
      </div>
    </footer>
  );
}
