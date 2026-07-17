# Architecture

## Overview

SnackCo is a two-tier application: a React single-page app (`client/`) talks to a stateless Express REST API (`server/`) over HTTP, backed by a single MongoDB Atlas cluster. There's no server-side rendering, no separate BFF layer, and no message queue/worker process — everything runs as one Node process per environment (dev, and one Render web service in production).

```
Browser (React SPA)
   │  HTTPS, cookies (JWT access/refresh, CSRF token)
   ▼
Express API (server/)
   │
   ├── MongoDB Atlas (Mongoose)
   ├── Cloudinary (signed direct-to-cloud image uploads)
   ├── Resend (transactional email)
   ├── Razorpay (payment orders, signature verification, webhook)
   └── Google OAuth (Passport strategy)
```

## Backend structure (`server/src`)

Each resource (products, orders, categories, coupons, users, reviews, newsletter, ...) follows the same layering:

```
routes/<resource>.routes.ts        → Express Router: path + middleware + validation wiring
controllers/<resource>.controller.ts → thin HTTP handlers (parse request, call services/model, shape response)
validation/<resource>.validation.ts → Zod schemas, one per endpoint, used by validateRequest middleware
models/<Resource>.model.ts         → Mongoose schema
services/                          → business logic that's reused across controllers, or talks to a third party
```

`routes/index.ts` mounts every resource router under `/api/v1`. `app.ts` is the only place the global Express middleware stack is assembled — read it top-to-bottom to see the exact request pipeline:

```
helmet → cors → compression → (Razorpay webhook, raw body) → json/urlencoded body parsing
  → mongoSanitize → hpp → cookieParser → csrfProtection → passport.initialize()
  → morgan → global rate limiter → sitemap/docs routes → maintenanceGate → /api/v1 routes
  → notFoundHandler → errorHandler
```

Notable middleware:
- **`csrfProtection`** (`middleware/csrfMiddleware.ts`) — issues a non-httpOnly `csrfToken` cookie and requires it echoed back as an `x-csrf-token` header on every non-GET/HEAD/OPTIONS request (double-submit-cookie CSRF pattern).
- **`authenticate`/`authorize`** (`middleware/authMiddleware.ts`) — reads the httpOnly `accessToken` cookie, verifies the JWT, and (for `authorize('admin')`) checks the role embedded in the token.
- **`validateRequest`** (`middleware/validateRequest.ts`) — takes `{ body?, params?, query? }` Zod schemas and rejects with a 400 on the first validation failure; on success it replaces `req.body`/`req.params`/`req.query` with the *parsed* (and therefore typed, defaulted, coerced) values.
- **rate limiters** (`middleware/rateLimiters.ts`) — per-route limiters (login, register, OTP request/verify, password reset, newsletter, contact) plus a blanket 200-req/15min limiter applied globally in `app.ts`.
- **`errorHandler`** (`middleware/errorHandler.ts`) — the single place HTTP error responses are shaped. Route/controller code throws `AppError(message, statusCode, isOperational?, code?)`; anything else (an unexpected exception) is logged and returned as a generic "Internal server error" with no internal detail leaked to the client.

### Environment configuration

`config/env.ts` parses `process.env` through a single Zod schema once at boot. In production, a `superRefine` step fails startup (`process.exit(1)`) if any integration the app advertises as working (email, payments, image uploads, Google login, JWT secrets) is missing — the intent is that a misconfigured production deploy fails loudly at boot rather than silently degrading a feature customers rely on. In development, missing integrations degrade gracefully (e.g. `sendEmail` logs a warning and no-ops instead of throwing) so a fresh clone can run without every third-party account set up.

## Frontend structure (`client/src`)

- **`routes/AppRoutes.tsx`** is the single React Router route table. Every page is lazy-loaded (`React.lazy`), and customer/admin sections are wrapped in `ProtectedRoute` where auth is required.
- **`redux/`** — one Redux store (`redux/store.ts`). `slices/` holds genuinely client-side state (cart, compare list, auth snapshot); `api/` holds RTK Query "API slices" — one file per backend resource, each injecting endpoints into a single shared `baseApi` (`redux/api/baseApi.ts`). All server data flows through RTK Query, not through hand-rolled `useEffect`+`fetch`.
- **`components/ui/`** is a small local design-system layer (button, input) built with `class-variance-authority` + Tailwind, in the shadcn/ui style, but hand-maintained in this repo rather than pulled from the shadcn CLI.
- **`components/shared/`** holds cross-cutting UI used by both customer and admin surfaces (headers, drawers, loaders, pagination, breadcrumbs). Overlay/drawer components (`MobileNavDrawer`, `MiniCart`, `MobileFilterSheet`) all follow the same pattern: rendered as siblings of the page content (never nested inside another `position: sticky`/`backdrop-filter` ancestor, which can break `position: fixed` children on some mobile browsers), animated with Framer Motion's `AnimatePresence`, and lock `document.body` scroll while open.

### Auth state on the frontend

There is no token stored in `localStorage` or Redux — the JWTs live only in httpOnly cookies the browser manages automatically. `state.auth` (in Redux) is just a *cache* of "am I logged in and as whom," populated by `App.tsx` calling `GET /auth/me` on load and kept in sync as mutations invalidate the `User` RTK Query tag. `ProtectedRoute` reads both the Redux snapshot and the live `useGetCurrentUserQuery()` result together (not just Redux) specifically to avoid a race where a freshly-authenticated user gets bounced to `/login` for one render before the Redux sync effect has run.

## Data model (MongoDB / Mongoose, `server/src/models`)

| Model | Purpose |
|---|---|
| `User` | Customers and admins (`role` field). Holds password hash, Google `googleId`, email-verification/OTP fields, wishlist, wallet, addresses. |
| `RefreshToken` | One document per issued refresh token (hashed), enabling rotation and reuse detection independent of the JWT's own expiry. |
| `Product` | Catalog item — pricing, stock, images, nutrition facts, and an **embedded** `reviews` array (reviews are subdocuments of the product they belong to, not a separate collection). |
| `Category` / `SubCategory` / `Brand` / `Tag` | Taxonomy used to filter/organize products. |
| `Order` | Snapshots order items, shipping address, pricing breakdown, payment/provider state, and a `statusHistory` audit trail. Supports both authenticated and guest checkout (`isGuest`, `guestEmail`/`guestName`/`guestPhone`). |
| `Coupon` | Manual codes and automatic promotional offers; tracks redemptions. |
| `Subscriber` | Newsletter list. |
| `ContactMessage` | Contact-form submissions, visible to admins. |

## Key flows

### Registration → OTP verification → login

1. `POST /auth/register` creates the user (unverified), generates a 6-digit OTP (SHA-256 hashed at rest, 10-minute expiry), and emails it. **No session is issued at this point.**
2. `POST /auth/verify-registration-otp` checks the OTP, marks `isEmailVerified = true`, and *then* issues the access/refresh cookies.
3. `POST /auth/login` (password) explicitly rejects unverified accounts with a structured `EMAIL_NOT_VERIFIED` error code (see `AppError`'s optional `code` param and `errorHandler`), which the frontend uses to redirect back into the OTP-verification flow instead of showing a generic "login failed" message.
4. Google OAuth and the separate OTP-*login* flow (`/auth/otp/request` + `/auth/otp/verify`, for already-registered users who want a passwordless sign-in) both mark `isEmailVerified = true` on success, since successfully receiving/using either is itself proof of email ownership.

### Checkout & payment (`controllers/order.controller.ts`)

- `POST /orders` always creates the `Order` document first. For **Razorpay**, it additionally creates a Razorpay order and returns checkout parameters to the frontend, leaving `order.status = 'pending'` — coupon redemption, stock decrement, and the confirmation email are all deferred until payment is actually confirmed. For **COD**, those same three side effects run immediately, but each is individually wrapped in try/catch and logged rather than allowed to fail the whole request — the order already exists in the database by that point, so a transient failure in (say) email delivery must not make the customer see "order failed" for an order that actually succeeded.
- `POST /orders/verify-payment` verifies the Razorpay signature server-side, then applies the same three side effects, guarded by a `wasAlreadyConfirmed` check so a client-driven verify call and the async Razorpay webhook (`POST /orders/payment/webhook`, mounted with a raw body parser *before* the JSON body parser in `app.ts`, since Razorpay's webhook signature is computed over the raw body) can't double-apply them if both fire for the same order.
- The frontend also handles the case where Razorpay's checkout uses a full-page redirect instead of its in-page modal (some UPI/netbanking flows do this): a pending-payment marker is written to `sessionStorage` before opening the Razorpay checkout, and `CheckoutPage` checks for it (plus any `razorpay_*` query params) on mount to resume/complete verification instead of silently stranding the user back on the checkout page.

### Image uploads

The frontend never sends raw image bytes to the Express server. It requests a **signed upload signature** from `POST /uploads/signature`, then uploads directly from the browser to Cloudinary using that signature. This keeps large file uploads off the API server entirely and off any request-size limit it enforces.

## Deployment topology

Frontend and backend are deployed to **different origins** (Vercel and Render respectively). Because the auth cookies are httpOnly and the CSRF cookie needs to be readable by frontend JS, a cookie set directly by the backend's origin is invisible to `document.cookie` reads on the frontend's origin — cross-site cookies don't solve this cleanly and are increasingly blocked by browsers regardless. The fix in place: `client/vercel.json` rewrites every `/api/*` request from the Vercel domain through to the Render backend server-side, so from the browser's perspective all requests (and their `Set-Cookie` responses) are same-origin. `VITE_API_BASE_URL` in production is therefore a **relative** path (`/api/v1`), not the Render URL directly. See `docs/DEPLOYMENT.md` for the full reasoning and setup steps — this detail matters if you ever change how the two are hosted.
