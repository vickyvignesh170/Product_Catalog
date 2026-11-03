import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { logMessage } from '@server/utils/loggers';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 1. Define the validation schema for environment variables
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url({ message: "Must be a valid URL string" }),
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
} as const;

export type Config = typeof config;
