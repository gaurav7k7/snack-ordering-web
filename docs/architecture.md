# Architecture

## Structure

- `client/src/components`: reusable UI split into shared, customer, admin, and shadcn/ui primitives.
- `client/src/pages`: route-level screens split by customer, admin, auth, and shared experiences.
- `client/src/redux`: store setup, slices, and RTK Query APIs.
- `client/src/services`: client-only integrations such as Cloudinary widget helpers.
- `server/src/controllers`: HTTP request handlers.
- `server/src/services`: business logic and external provider integrations.
- `server/src/routes`: API route modules.
- `server/src/middleware`: auth, validation, security, errors, and request lifecycle middleware.
- `server/src/models`: Mongoose schemas.
- `server/src/validation`: request validation schemas.

## Deployment Targets

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas
- Images: Cloudinary
