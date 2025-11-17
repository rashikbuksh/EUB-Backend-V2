/* eslint-disable node/no-process-env */
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'node:path';
import { z } from 'zod';

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  ),
}));

const logLevel = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const EnvSchema = z.object({
  SERVER_URL: z.string().default('http://localhost:3005'),
  PRODUCTION_URL: z.string().default('http://103.147.163.46:4040'),
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(logLevel),
  DATABASE_URL: z.string().url(),
  // DATABASE_AUTH_TOKEN: z.string().optional(),
  PRIVATE_KEY: z.string(),
  SALT: z.coerce.number(),
  PULL_MODE: z.string().default('1'),
  USE_CRLF: z.string().default('1'),
  DEFAULT_LOOKBACK_HOURS: z.string().default('48'),
  ICLOCK_COMMAND: z.string().default('ATTLOG'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_EMAIL: z.string().default('jobayer@fortunezip.com'),
  SMTP_PASSWORD: z.string().default('flyd rmjn lwzw dkuq'),
  DEPARTMENT_NAME: z.string().default('BWT Finance Department'),
  SUPPORT_EMAIL: z.string().default('support@bwt.com'),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
