import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required.'),
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-me-in-production-123456'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-me-in-production-123456'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_REMEMBER_ME_EXPIRES_IN: z.string().default('30d'),
  COOKIE_SECRET: z.string().default('dev-cookie-secret-change-me-in-production-123456'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
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
  jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  jwtRefreshRememberMeExpiresIn: parsedEnv.data.JWT_REFRESH_REMEMBER_ME_EXPIRES_IN,
  cookieSecret: parsedEnv.data.COOKIE_SECRET,
  googleClientId: parsedEnv.data.GOOGLE_CLIENT_ID,
  googleClientSecret: parsedEnv.data.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: parsedEnv.data.GOOGLE_CALLBACK_URL,
  smtpHost: parsedEnv.data.SMTP_HOST,
  smtpPort: parsedEnv.data.SMTP_PORT,
  smtpUser: parsedEnv.data.SMTP_USER,
  smtpPass: parsedEnv.data.SMTP_PASS,
  smtpFrom: parsedEnv.data.SMTP_FROM,
  razorpayKeyId: parsedEnv.data.RAZORPAY_KEY_ID,
  razorpayKeySecret: parsedEnv.data.RAZORPAY_KEY_SECRET,
  cloudinaryCloudName: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsedEnv.data.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
} as const;
