import { StaticPageLayout } from '@/components/shared/StaticPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      description="How Lotus Delight collects, uses, and protects your personal information."
      breadcrumbLabel="Privacy Policy"
    >
      <p>Last updated: January 2026</p>

      <h2>1. Information we collect</h2>
      <p>When you create an account, place an order, or contact us, we collect:</p>
      <ul>
        <li>Account details — name, email, phone number, and password (stored hashed, never in plain text).</li>
        <li>Order details — shipping address, items purchased, and payment status (we never store your full card or UPI details — payments are processed directly by Razorpay).</li>
        <li>Usage data — pages visited, products viewed, and wishlist/cart activity, used to improve recommendations and site performance.</li>
        <li>Communications — messages you send via our contact form or customer support.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <p>
        We use your data to process orders, send transactional emails (order confirmation, shipping updates, OTP
        codes, password resets), respond to support requests, and — only if you opt in — send newsletter updates
        about new products and offers. We do not sell your personal information to third parties.
      </p>

      <h2>3. Third-party services</h2>
      <p>We share the minimum necessary data with trusted processors to operate the store:</p>
      <ul>
        <li><strong>Razorpay</strong> — payment processing.</li>
        <li><strong>Cloudinary</strong> — image hosting for product photos and review images you upload.</li>
        <li><strong>Google</strong> — optional sign-in via Google OAuth, if you choose that login method.</li>
      </ul>

      <h2>4. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember your cart, and a small set of preference
        cookies (like theme). You can review and accept our cookie usage via the banner shown on your first visit.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You can view and update your profile information at any time from your account settings, request a copy of
        your data, or ask us to delete your account by contacting support. Deleting your account deactivates it —
        order history is retained as required for tax and accounting purposes.
      </p>

      <h2>6. Data security</h2>
      <p>
        Passwords are hashed with bcrypt, sessions use httpOnly cookies, and all traffic is encrypted in transit.
        We continuously review our security practices as the platform grows.
      </p>

      <h2>7. Contact us</h2>
      <p>
        Questions about this policy? Reach out via our <strong>Contact</strong> page and we'll respond within 1-2
        business days.
      </p>
    </StaticPageLayout>
  );
}
