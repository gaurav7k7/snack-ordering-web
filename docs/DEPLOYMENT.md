# Deployment

Current production topology: **frontend on Vercel, backend on Render, database on MongoDB Atlas, email on Resend, images on Cloudinary, payments on Razorpay, OAuth via Google**. This doc covers setting all of that up from scratch, plus a troubleshooting section for the specific mistakes that are easy to make with this exact setup (all of them have actually happened during development of this project).

## Why frontend and backend are on different platforms

Vercel is excellent for static/SPA hosting (edge network, instant cache invalidation, zero-config previews) but is not the right shape for a long-running stateful Express process. Render (or a similar PaaS) is the reverse. Splitting them is standard practice — the one non-obvious consequence is **cookie handling**, covered in detail below, because it caused real bugs during this project's development and will bite you again if you change the topology without understanding why.

## 1. Accounts you need

| Service | Used for | Free tier available? |
|---|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Database | Yes (M0) |
| [Cloudinary](https://cloudinary.com) | Image hosting/transforms | Yes |
| [Resend](https://resend.com) | Transactional email | Yes (3,000/mo, 100/day) |
| [Razorpay](https://razorpay.com) | Payments | Test mode is free; live mode requires KYC, no subscription — per-transaction fees only |
| [Google Cloud Console](https://console.cloud.google.com) | Google OAuth | Free |
| [Render](https://render.com) | Backend hosting | Yes, but see the cold-start warning below |
| [Vercel](https://vercel.com) | Frontend hosting | Yes for personal use — commercial use requires Pro |
| A domain registrar (e.g. Cloudflare Registrar, Namecheap) | Custom domain | ~$10–15/year |

## 2. MongoDB Atlas

1. Create a free cluster (M0 is fine to start).
2. **Database Access** → add a database user with a strong generated password.
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere). This is the standard approach for PaaS backends without a static IP — safe as long as your database user password is strong, since Atlas still requires authentication.
4. Copy the connection string from **Connect → Drivers** — this is your `MONGODB_URI`. Replace `<password>` with the real password and add a database name before the `?`, e.g. `.../lotusdelight?appName=Cluster0`.

**Scaling up later:** M0 caps at 512MB storage and throttles under load with no backups. When you have real traffic, move to a shared M2/M5 tier (~$9–25/mo) or a dedicated M10 (~$57/mo, includes automated backups) — Atlas migrates live with no downtime.

## 3. Cloudinary

1. Sign up, grab **Cloud name**, **API Key**, **API Secret** from the dashboard.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` on the backend.
3. Nothing else to configure — the app uses *signed* uploads (`POST /uploads/signature`), so no upload preset needs to be created in the Cloudinary dashboard.

## 4. Resend (email)

1. Sign up, go to **API Keys** → create a key. This is `RESEND_API_KEY`.
2. **Without a verified domain**, Resend only lets you send from `onboarding@resend.dev`, and only *to the account owner's own email address*. This is fine for development but means real customers won't receive emails until you verify a domain — do this before considering the site launch-ready:
   - Resend dashboard → **Domains** → **Add Domain**.
   - Add the DKIM/SPF DNS records it gives you at your DNS provider (see the domain section below).
   - Once verified, set `RESEND_FROM_EMAIL=Lotus Delight <noreply@yourdomain.com>`.

## 5. Razorpay

1. Sign up, use **test mode** keys (`rzp_test_...`) for development — free, no KYC needed.
2. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. To accept real payments: complete Razorpay's KYC (business PAN, bank account, GST if applicable), then switch to live keys (`rzp_live_...`). There's no subscription fee — Razorpay charges a percentage per transaction.
4. If you use the webhook (`POST /orders/payment/webhook`), configure the webhook URL in the Razorpay dashboard to point at `https://<your-backend-domain>/api/v1/orders/payment/webhook` and set the webhook secret Razorpay gives you.

## 6. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials** → create an **OAuth 2.0 Client ID** (type: Web application).
2. **Authorized JavaScript origins**: your frontend URL(s), e.g. `http://localhost:5173` and `https://yourdomain.com`.
3. **Authorized redirect URIs** — this is the one that trips people up, see the callout below. Add:
   ```
   http://localhost:5000/api/v1/auth/google/callback        (local dev)
   https://yourdomain.com/api/v1/auth/google/callback        (production — your FRONTEND domain, see below)
   ```
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` on the backend. In production, `GOOGLE_CALLBACK_URL` must be the **frontend** URL variant above, not the Render backend URL directly.

> **Why the frontend domain, not the backend domain?** Google redirects the user's browser straight to whatever `GOOGLE_CALLBACK_URL` says — that's a real browser navigation, not something your frontend code controls. If it pointed at the Render backend directly, the session cookies Google's callback sets would land on the Render domain, invisible to the frontend's `document.cookie` — the user would appear logged in on the backend but as a guest on the frontend. Pointing it at the frontend domain routes the request through the Vercel proxy (see §8) so the cookies land on the domain the frontend actually reads from.
>
> **A mistake that happened during development:** pasting the redirect URI from a chat/markdown code block picked up a trailing newline character, which made the registered URI byte-for-byte different from what the server actually sent as `redirect_uri` — Google rejected it with a generic `Error 400: invalid_request` that gave no hint about the whitespace. If you get this error and the URIs *look* identical, retype the value by hand in both places instead of pasting, and check for a stray newline (press End after pasting into the field and confirm the cursor doesn't jump to a new line).

## 7. Deploy the backend (Render)

1. New Web Service → connect your GitHub repo → **Root Directory**: `server`.
2. **Build Command**:
   ```
   npm install --include=dev && npm run build
   ```
   Do not use plain `npm install` — Render sets `NODE_ENV=production` during the build step by default, and npm skips `devDependencies` (which includes `typescript` and `@types/node`, both required to compile) when `NODE_ENV=production`. Without `--include=dev` the build fails with `TS2688: Cannot find type definition file for 'node'`.
3. **Start Command**: `npm start`
4. Add every environment variable from `server/.env.example` under **Environment** (see the [README's env var table](../README.md#environment-variables) for what each one does). Set `NODE_ENV=production` — this activates the boot-time check that refuses to start if any required integration is missing, which is exactly what you want in production (fail loudly at deploy time, not silently at request time).
5. Deploy. Watch the **Logs** tab for `MongoDB connected` and `Server running on port...` — if it hangs on "No open ports detected," the most common cause is MongoDB Atlas's Network Access list not allowing Render's IPs (see §2 step 3), since the server calls `connectDatabase()` before it starts listening.
6. **Free tier warning**: Render's free instances spin down after ~15 minutes idle, and the next request pays a 50+ second cold-start penalty. This is fine for testing but will make the site feel broken to real visitors — upgrade to at least the Starter plan ($7/mo) before sharing the site publicly.

## 8. Deploy the frontend (Vercel)

1. New Project → import the repo → **Root Directory**: `client` (Vercel auto-detects the Vite framework preset).
2. Environment variables:
   - `VITE_API_BASE_URL` = `/api/v1` (a **relative** path — see below, not the Render URL)
   - `VITE_SITE_URL` = your production frontend URL
3. `client/vercel.json` (already in the repo) proxies all `/api/*` requests to the Render backend:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://<your-backend>.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   Update the `destination` to your actual Render service URL. The second rule is the SPA fallback (serves `index.html` for client-side routes like `/products/:slug`) — Vercel's zero-config Vite handling normally does this automatically, but defining your own `rewrites` array opts out of that, so it has to be listed explicitly.
4. Deploy. **`VITE_*` variables are baked into the static build at build time** — changing one in the Vercel dashboard does nothing until you trigger a redeploy.

> **Why is `VITE_API_BASE_URL` relative, not the Render URL?** This is the same cookie-origin issue as the Google callback: if the frontend called the Render backend directly, every `Set-Cookie` response would land on the Render domain, invisible to `document.cookie` on the Vercel domain — breaking CSRF (the frontend can never read the token to echo it back) and login persistence, regardless of CORS settings or browser privacy modes. Routing everything through the same-origin Vercel proxy avoids this entirely.

## 9. Custom domain

1. Buy a domain (Cloudflare Registrar sells at cost, no markup, ~$10/yr).
2. Point it at Vercel: Project → Settings → Domains → add your domain, follow Vercel's DNS instructions.
3. Update on the backend: `CLIENT_URL`, `SITE_URL`, `GOOGLE_CALLBACK_URL` → your new domain.
4. Update Google Cloud Console's Authorized redirect URIs / JavaScript origins → your new domain.
5. Verify the domain with Resend (§4) and set `RESEND_FROM_EMAIL` accordingly.
6. Redeploy the backend after any env var change.

## Troubleshooting

**Backend build fails with `TS2688: Cannot find type definition file for 'node'`**
→ Build Command is missing `--include=dev`. See §7 step 2.

**Backend deploy hangs, "No open ports detected, continuing to scan..."**
→ Usually MongoDB Atlas rejecting the connection because Render's IP isn't allowlisted. Add `0.0.0.0/0` in Atlas Network Access (§2 step 3), and double-check `MONGODB_URI` is the real value, not a placeholder.

**Frontend deploys but the whole page is blank after a later deploy, with 404s on JS files in the console**
→ Stale service worker. Vite renames JS/CSS files with a content hash on every build; a service worker that cache-first-serves the old `index.html` will keep requesting hashed filenames that no longer exist. Fixed in `client/public/sw.js` (navigation requests are network-first now) — if you ever touch that file again, keep that property: never cache-first the HTML shell, only content-hashed assets.

**Login/CORS errors in the browser console referencing a mismatched `Access-Control-Allow-Origin`**
→ `CLIENT_URL` on the backend has a typo or trailing slash that doesn't exactly match the frontend's origin. The `cors` middleware does an exact string comparison — `https://example.com/` and `https://example.com` are different strings.

**`POST /auth/login` (or any mutating request) returns 403 "Invalid or missing CSRF token"**
→ The frontend isn't reading the `csrfToken` cookie, almost always because it's calling the backend cross-origin instead of through the Vercel proxy. Confirm `VITE_API_BASE_URL` is a relative path in production (§8) and that `client/vercel.json`'s rewrite destination is correct.

**Google login "succeeds" but the site still shows the user as logged out / no logout button appears**
→ `GOOGLE_CALLBACK_URL` points at the Render backend directly instead of the frontend domain. See the callout in §6.

**`Error 400: invalid_request` from Google, even though the redirect URI looks identical in both places**
→ Check for a trailing newline or space in the value — retype it by hand rather than pasting. See the callout in §6.

**OTP/verification emails never arrive, but the API call reports success**
→ If this happens with `RESEND_API_KEY` unset, that's expected — email is a no-op with a console warning when unconfigured in development. In production, `NODE_ENV=production` should have refused to boot in this state (§7 step 4) — if it didn't, double-check `NODE_ENV` is actually set to `production` on your host, not left at the default.

**OTP/registration emails only reach one address and error for everyone else**
→ Resend sandbox-mode restriction — you haven't verified a sending domain yet. See §4 step 2. This isn't a bug, it's Resend's anti-abuse policy for unverified accounts.

**A raw "Internal server error" instead of a useful message**
→ By design: `middleware/errorHandler.ts` only reflects `.message` for `AppError` instances; anything else (an unexpected exception, e.g. a third-party API failure) is deliberately masked to avoid leaking internals to the client. Check the server logs (Render → Logs) for the real error and stack trace.
