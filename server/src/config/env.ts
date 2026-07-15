import { z } from 'zod';

// Dev-only fallbacks so a fresh clone can run locally without any setup.
// These are intentionally NEVER used in production — see the superRefine
// below, which fails startup if production is missing a real secret rather
// than silently falling back to a value that's sitting in the source code.
const DEV_ONLY_ACCESS_SECRET = 'dev-access-secret-change-me-in-production-123456';
const DEV_ONLY_REFRESH_SECRET = 'dev-refresh-secret-change-me-in-production-123456';
const DEV_ONLY_COOKIE_SECRET = 'dev-cookie-secret-change-me-in-production-123456';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required.'),
    JWT_ACCESS_SECRET: z.string().min(32).optional(),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_REMEMBER_ME_EXPIRES_IN: z.string().default('30d'),
    COOKIE_SECRET: z.string().min(32).optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    MAINTENANCE_MODE: z.coerce.boolean().default(false),
    SITE_URL: z.string().url().default('http://localhost:5173'),
    SUPPORT_EMAIL: z.string().email().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;

    const requiredSecrets = [
      ['JWT_ACCESS_SECRET', data.JWT_ACCESS_SECRET],
      ['JWT_REFRESH_SECRET', data.JWT_REFRESH_SECRET],
      ['COOKIE_SECRET', data.COOKIE_SECRET],
    ] as const;

    for (const [key, value] of requiredSecrets) {
      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be set to a real secret (min 32 chars) in production.`,
        });
      }
    }

    // Every one of these backs a feature the app advertises as working
    // (email, OTP delivery, payments, image uploads, Google login) — degrade
    // gracefully in development, but fail startup in production rather than
    // silently shipping a broken checkout/upload/login path.
    const requiredIntegrations = [
      ['RESEND_API_KEY', data.RESEND_API_KEY],
      ['RAZORPAY_KEY_ID', data.RAZORPAY_KEY_ID],
      ['RAZORPAY_KEY_SECRET', data.RAZORPAY_KEY_SECRET],
      ['CLOUDINARY_CLOUD_NAME', data.CLOUDINARY_CLOUD_NAME],
      ['CLOUDINARY_API_KEY', data.CLOUDINARY_API_KEY],
      ['CLOUDINARY_API_SECRET', data.CLOUDINARY_API_SECRET],
      ['GOOGLE_CLIENT_ID', data.GOOGLE_CLIENT_ID],
      ['GOOGLE_CLIENT_SECRET', data.GOOGLE_CLIENT_SECRET],
      ['GOOGLE_CALLBACK_URL', data.GOOGLE_CALLBACK_URL],
    ] as const;

    for (const [key, value] of requiredIntegrations) {
      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be set in production — this backs a feature (email/payments/uploads/Google login) the app requires.`,
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  clientUrl: parsedEnv.data.CLIENT_URL,
  mongodbUri: parsedEnv.data.MONGODB_URI,
  jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET ?? DEV_ONLY_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET ?? DEV_ONLY_REFRESH_SECRET,
  jwtAccessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  jwtRefreshRememberMeExpiresIn: parsedEnv.data.JWT_REFRESH_REMEMBER_ME_EXPIRES_IN,
  cookieSecret: parsedEnv.data.COOKIE_SECRET ?? DEV_ONLY_COOKIE_SECRET,
  googleClientId: parsedEnv.data.GOOGLE_CLIENT_ID,
  googleClientSecret: parsedEnv.data.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: parsedEnv.data.GOOGLE_CALLBACK_URL,
  resendApiKey: parsedEnv.data.RESEND_API_KEY,
  resendFromEmail: parsedEnv.data.RESEND_FROM_EMAIL,
  razorpayKeyId: parsedEnv.data.RAZORPAY_KEY_ID,
  razorpayKeySecret: parsedEnv.data.RAZORPAY_KEY_SECRET,
  cloudinaryCloudName: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsedEnv.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
  maintenanceMode: parsedEnv.data.MAINTENANCE_MODE,
  siteUrl: parsedEnv.data.SITE_URL,
  supportEmail: parsedEnv.data.SUPPORT_EMAIL,
} as const;

if (env.nodeEnv !== 'production' && (!parsedEnv.data.JWT_ACCESS_SECRET || !parsedEnv.data.JWT_REFRESH_SECRET || !parsedEnv.data.COOKIE_SECRET)) {
  console.warn(
    '[env] Using insecure development-only secrets for JWT/cookies. Set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET and COOKIE_SECRET before deploying to production.',
  );
}
