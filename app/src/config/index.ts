import { envSchema, type EnvConfig } from '../schemas';

/**
 * Validate and export environment configuration
 */
export const env: EnvConfig = envSchema.parse(process.env);

/**
 * API configuration constants
 */
export const API_CONFIG = {
  title: 'Healthcare DRG Optimization API',
  description:
    'API for optimizing ICD-10 diagnosis codes to maximize adjusted Relative Weight (adj RW)',
  version: '1.0.0',
  maxRequestTimeout: 120000, // 2 minutes
  maxFileSize: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : ['*'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
} as const;