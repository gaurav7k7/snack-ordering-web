# Lotus Delight — MERN E-Commerce Platform

A production MERN-stack e-commerce application for ordering snacks online — customer storefront, cart/checkout with Razorpay and Cash-on-Delivery, and a full admin dashboard for managing products, orders, coupons, customers, reviews, and newsletter subscribers.

This README is the entry point. Deeper topics live in [`docs/`](docs/):

- [`docs/architecture.md`](docs/architecture.md) — how the codebase is organized and how requests flow through it
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — hosting accounts, environment variables, and step-by-step deploy instructions
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to propose changes

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Monorepo layout](#monorepo-layout)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Key flows](#key-flows)
- [API documentation](#api-documentation)
- [Testing & verification](#testing--verification)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

**Customer storefront**
- Product catalog with search, filtering (category, brand, rating, availability, discount), and sorting; a dedicated mobile filter sheet keeps the same functionality usable on small screens
- Product detail pages with reviews, ratings, recommended/related products, and image galleries
- Cart, wishlist, and a side-by-side product comparison tool
- Checkout with Cash on Delivery and Razorpay (cards/UPI/netbanking), including guest checkout
- Order history, order detail with status timeline, cancellation/return requests, and downloadable PDF invoices
- Email/password login, Google OAuth, and OTP-based email login; registration is gated behind email OTP verification
- Coupon codes and automatically-applied promotional offers
- Newsletter signup

**Admin dashboard**
- Sales/orders analytics dashboard
- Product catalog management (create/edit/bulk import via CSV, categories, sub-categories, brands, tags, inventory/stock levels)
- Order management (status updates, cancellations, refunds, delivery assignment)
- Coupon management
- Customer management (block/unblock, password reset, order & review history)
- Review moderation
- Newsletter subscriber management with CSV/XLSX/JSON export

**Platform-level**
- JWT access/refresh token auth via httpOnly cookies, CSRF protection (double-submit cookie), rate limiting, input sanitization, security headers (helmet)
- Transactional email via Resend (OTP codes, password reset, order confirmations, admin alerts)
- Image uploads via signed, direct-to-Cloudinary uploads
- OpenAPI/Swagger documentation served from the running API
- A maintenance-mode gate and a sitemap route for SEO

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Redux Toolkit + RTK Query, React Router 7, Tailwind CSS, Framer Motion, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript, MongoDB + Mongoose, Passport (Google OAuth), JWT, Zod |
| Payments | Razorpay |
| Email | Resend |
| Images | Cloudinary |
| Database hosting | MongoDB Atlas |
| Deployment | Vercel (frontend), Render (backend) |

## Monorepo layout

This is an npm-workspaces monorepo with two packages:

```
client/   React + Vite single-page app (the storefront and admin UI)
server/   Express + TypeScript REST API
docs/     Project documentation
```

Root-level scripts (see [Available scripts](#available-scripts)) run both workspaces together.

## Prerequisites

- Node.js ≥ 20, npm ≥ 10 (enforced via `engines` in `package.json`)
- A MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works for local development)
- Accounts for the services you want to exercise locally: [Cloudinary](https://cloudinary.com) (image uploads), [Resend](https://resend.com) (email), [Razorpay](https://razorpay.com) (payments, test mode keys are free), [Google Cloud Console](https://console.cloud.google.com) (OAuth, optional)

None of the third-party integrations are required to boot the app in development — each one degrades gracefully (uploads/emails/Google login/payments simply won't work) if its env vars are left unset. They *are* required in production; see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Getting started

```bash
# 1. Clone and install
git clone <this-repo-url>
cd "final snack project"
npm install                     # installs both workspaces via npm workspaces

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# edit both files — see "Environment variables" below

# 3. Run both apps in development
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (API base: `http://localhost:5000/api/v1`)
- Swagger UI: http://localhost:5000/api-docs

You need at least `MONGODB_URI` set in `server/.env` for the backend to start — everything else in the env files is optional for local development.

## Environment variables

Both workspaces read from a `.env` file that is **gitignored** — never commit real secrets. Use the `.env.example` files as the source of truth for which keys exist; the tables below explain what each one is for.

### `server/.env`

| Variable | Required in prod? | Purpose |
|---|---|---|
| `NODE_ENV` | — | `development` \| `production` \| `test`. Production mode enforces that every integration below is actually configured (fails startup otherwise) and tightens cookie security. |
| `PORT` | — | Port the API listens on (defaults to `5000`). |
| `CLIENT_URL` | ✅ | The frontend's origin. Used for CORS and for building links in emails (verification, password reset). |
| `SITE_URL` | ✅ | Public site URL, used in a couple of places email templates reference. |
| `MONGODB_URI` | ✅ | MongoDB connection string. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` | ✅ | 32+ character random secrets. Dev-only fallback values are used automatically if unset in development — production refuses to boot without real ones. |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` / `JWT_REFRESH_REMEMBER_ME_EXPIRES_IN` | — | Token lifetimes (defaults: `15m` / `7d` / `30d`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | ✅ | Google OAuth app credentials. `GOOGLE_CALLBACK_URL` must exactly match an Authorized redirect URI registered in Google Cloud Console (no trailing whitespace!). |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | ✅ | Transactional email via [Resend](https://resend.com). Without a verified sending domain, Resend only allows sending to the account owner's own inbox — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API credentials (test-mode keys for development, live keys — after KYC — for production). |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ | Image upload/hosting. |
| `MAINTENANCE_MODE` | — | `true`/`false`. When true, the API and frontend show a maintenance page instead of normal traffic. |
| `SUPPORT_EMAIL` | — | Inbox that contact-form submissions get forwarded to. |

The full, enforced list of production-required variables lives in `server/src/config/env.ts` (`envSchema`'s `superRefine`) — that file is the actual source of truth if this table ever drifts.

### `client/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend calls for the API, e.g. `http://localhost:5000/api/v1` locally, or a relative `/api/v1` in production if you're proxying through Vercel (see `client/vercel.json`). |
| `VITE_SITE_URL` | Public site URL, used for canonical links/SEO tags. |
| `VITE_GA_MEASUREMENT_ID` / `VITE_META_PIXEL_ID` | Optional analytics IDs. Leave blank to disable. |

## Available scripts

Run from the repo root (each fans out to both workspaces):

| Command | What it does |
|---|---|
| `npm run dev` | Starts the client (Vite dev server) and server (`tsx watch`) concurrently |
| `npm run build` | Type-checks and builds both workspaces for production |
| `npm run lint` | Runs ESLint in both workspaces |
| `npm run typecheck` | Runs `tsc --noEmit` in both workspaces |
| `npm run format` | Runs Prettier across the repo |

Per-workspace (run inside `client/` or `server/`, or via `npm run <script> --workspace client|server`):

| Command | client | server |
|---|---|---|
| `dev` | Vite dev server | `tsx watch src/server.ts` (auto-restarts on change) |
| `build` | `tsc -b && vite build` | `tsc` (emits to `dist/`) |
| `start` | — | `node dist/server.js` (run the production build) |
| `preview` | Serves the production build locally | — |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` | ESLint / `tsc --noEmit` |

## Project structure

```
client/src/
  app/            App root component, top-level providers
  pages/          Route-level screens: customer/, admin/, auth/, static/, shared/
  components/     Reusable UI: customer/, admin/, auth/, orders/, reviews/, shared/, ui/ (design-system primitives)
  routes/         React Router route table (AppRoutes.tsx)
  redux/          Store setup, slices/ (client state), api/ (RTK Query endpoints, one file per resource)
  hooks/          Reusable React hooks
  services/       Client-only integrations (e.g. direct-to-Cloudinary upload helper)
  utils/          Formatting, CSV parsing, error-message extraction, etc.
  validation/      Zod schemas shared by forms
  types/          Shared TypeScript types
  constants/      Route paths, nav items, pricing constants, etc.

server/src/
  controllers/    HTTP request handlers — one file per resource, thin, delegate business logic to services/
  routes/         Express route modules, one per resource, wired together in routes/index.ts
  models/         Mongoose schemas
  services/       Business logic and third-party integrations (email, payments, uploads, inventory, coupons, etc.)
  middleware/     Auth, CSRF, validation, rate limiting, error handling, maintenance gate
  validation/     Zod request-validation schemas, paired 1:1 with routes
  utils/          Shared helpers (API response shape, pagination, logging, etc.)
  config/         Environment parsing (env.ts), database connection, Passport strategy
  docs/           Hand-maintained OpenAPI spec served at /api-docs
```

## Key flows

These are worth understanding before making changes in these areas — see `docs/architecture.md` for full detail.

- **Auth**: JWT access + refresh tokens in httpOnly cookies (not localStorage). Registration requires verifying a 6-digit emailed OTP before the account can log in; Google OAuth and email-OTP login are alternate paths that also mark the account verified. Refresh tokens are rotated and tracked in a `RefreshToken` collection so a reused/stolen token can be detected and revoked.
- **Checkout & payments**: `POST /orders` creates the order; for Razorpay it also creates a Razorpay order and returns checkout params, deferring stock decrement/coupon redemption/confirmation email until `POST /orders/verify-payment` (or the Razorpay webhook) confirms payment. For COD, those same side effects happen immediately, but are non-fatal — a failure in any one of them (e.g. an email provider hiccup) is logged and swallowed rather than failing an order that already exists in the database.
- **CSRF**: a non-httpOnly `csrfToken` cookie is set on every response; the frontend echoes it back as an `x-csrf-token` header on mutating requests (double-submit-cookie pattern). This only works when frontend and backend share an origin from the browser's point of view — see the proxy note in `client/vercel.json` and `docs/DEPLOYMENT.md` if you're deploying frontend/backend to different domains.

## API documentation

The full REST API is documented as an OpenAPI 3.0 spec (`server/src/docs/openapiSpec.ts`) and served live via Swagger UI at **`/api-docs`** on the running server (e.g. `http://localhost:5000/api-docs`). That spec is hand-maintained as a single source of truth rather than scattered across route files — update it alongside any route change.

## Testing & verification

There is no automated test suite yet (a real gap — see [Contributing](#contributing) if you want to help close it). The house convention for verifying a change:

1. `npm run typecheck` and `npm run lint` in both workspaces
2. `npm run build` in both workspaces
3. Exercise the actual change end-to-end — either by running the dev servers and driving the UI/API by hand, or with a short-lived script against a real (or scratch) MongoDB connection, cleaning up any test data afterward
4. For UI changes, check the affected pages at mobile, tablet, and desktop widths

## Deployment

Frontend on Vercel, backend on Render, database on MongoDB Atlas. Full step-by-step instructions — including the Vercel-proxy setup needed to keep cookies same-origin, and every third-party account you need — are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for coding conventions, branch/PR workflow, and how to get your local environment talking to real (or sandboxed) third-party services.
