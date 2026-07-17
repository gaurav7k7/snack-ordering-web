# Contributing

## Local setup

1. Follow the [Getting started](README.md#getting-started) section of the README.
2. You don't need every third-party account to work on most features:
   - No `MONGODB_URI`? The backend won't start — this one's required, use a free Atlas cluster or a local MongoDB instance.
   - No Cloudinary/Resend/Razorpay/Google credentials? The app boots fine and those specific features (image upload, email sending, payments, Google login) simply no-op or return a clear error — everything else works normally.
3. Run `npm run dev` from the repo root to start both the client and server with hot reload.

## Before opening a PR

```bash
npm run typecheck   # both workspaces
npm run lint         # both workspaces
npm run build        # both workspaces — catches issues typecheck alone can miss
```

There's no automated test suite yet, so **manually exercise the flow you changed** before calling it done:
- Backend change → hit the actual endpoint (curl, Postman, or through the UI) against a real or scratch database, and check the response shape matches what the frontend expects.
- Frontend change → run it in the browser, not just `tsc`. For anything touching layout, check mobile (~375px), tablet (~768–1024px), and desktop widths — this codebase has been bitten more than once by changes that only got checked at one breakpoint.
- Auth/payment/email changes → these are the highest-blast-radius areas in the app; walk the entire flow end-to-end (e.g. register → verify OTP → login, or place an order → verify payment → check it appears in order history and the admin dashboard) rather than testing the one endpoint you touched in isolation.

If you add or change a backend route, update `server/src/docs/openapiSpec.ts` in the same PR — it's hand-maintained and is the only API documentation that exists.

## Coding conventions

These aren't arbitrary style preferences — they're what the rest of the codebase already does, so follow them for consistency:

- **No comments explaining *what* code does** — clear naming should make that unnecessary. Comments are for the *why*: a non-obvious constraint, a workaround for a specific bug, a reason a simpler approach doesn't work. If you'd delete the comment without confusing a future reader, delete it.
- **Don't build abstractions for one caller.** Three similar lines in two places is better than a premature shared helper. Extract a shared component/function only once there's real, current duplication (not a hypothetical future need).
- **Backend**: every route pairs a Zod schema (`validation/`) with `validateRequest`; controllers stay thin and push business logic into `services/`; throw `AppError(message, statusCode, isOperational?, code?)` for expected failures (bad input, not found, forbidden) rather than a plain `Error` — plain errors get masked to a generic "Internal server error" by design (see `middleware/errorHandler.ts`), which is correct for genuinely unexpected failures but wrong for something you want the client to see a real message for.
- **Frontend**: all server data goes through an RTK Query API slice (`redux/api/*.ts`), not ad-hoc `fetch`/`useEffect`. Client-only state (cart, UI toggles) goes in a Redux slice (`redux/slices/*.ts`) or local `useState`, not RTK Query.
- **Non-critical vs. critical side effects**: if an action's entire purpose is a side effect (e.g. an OTP endpoint whose only job is sending an email), a failure there should be a loud, honest error (see `sendCriticalEmail` in `services/email.service.ts`). If a side effect is secondary to an action that already succeeded (e.g. a confirmation email after an order is already saved), wrap it in try/catch and log it — don't let it turn a successful primary action into a client-visible failure. Both patterns exist deliberately in `controllers/order.controller.ts`; match whichever one fits the change you're making.
- **Security-sensitive surfaces** (auth, payments, anything touching cookies/CSRF) — read `docs/architecture.md`'s "Key flows" section before changing these. The cookie/CSRF setup in particular has non-obvious constraints tied to the frontend/backend being on different origins in production.

## Branch & PR workflow

- Branch off `main`, open a PR against `main`.
- Keep PRs scoped to one change — a bug fix doesn't need to also refactor nearby code it didn't need to touch.
- Write commit messages and PR descriptions around *why*, not a restatement of the diff.
- Don't commit `.env` files or real secrets — `.env.example` is the place to document a new environment variable (with an empty/placeholder value).
