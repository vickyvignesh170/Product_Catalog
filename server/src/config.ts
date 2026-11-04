import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { logMessage } from '@server/utils/loggers';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 1. Define the validation schema for environment variables
const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url({ message: "Must be a valid URL string" }).default('http://localhost:5174'),
  SALES_EMAIL: z.string().email({ message: "Must be a valid email address" }).default('sales@productcatalog.local'),
  ALLOWED_DOMAINS: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175')
});

// 2. Validate process.env against the schema
const parsedEnv = envSchema.safeParse(process.env);

// 3. Handle validation errors gracefully at boot time
if (!parsedEnv.success) {
  logMessage('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

// 4. Export the validated data as a clean configuration object
export const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  salesEmail: parsedEnv.data.SALES_EMAIL,
  allowedDomains: parsedEnv.data.ALLOWED_DOMAINS.split(',').map((s) => s.trim())
} as const;

export type Config = typeof config;
