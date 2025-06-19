import { z } from 'zod';

/**
 * Zod schemas for request/response validation
 */

export const optimizationRequestSchema = z.object({
  availableCodes: z
    .array(z.string().min(1, 'Code cannot be empty'))
    .min(2, 'Need at least 2 available codes')
    .max(100, 'Too many codes provided'),
  datasetCsv: z.string().optional(),
  maxSecondaryDiagnoses: z.number().int().min(1).max(15).optional().default(12),
});

export const optimizationResponseSchema = z.object({
  success: z.boolean(),
  patternAnalysis: z.string().optional(),
  pdx: z.string().optional(),
  sdx: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
  estimatedAdjRw: z.number().optional(),
  confidenceLevel: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const fileUploadSchema = z.object({
  availableCodes: z.string().min(1, 'Available codes parameter is required'),
});

/**
 * Environment variables schema
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  DEEPSEEK_API_KEY: z.string().min(1, 'DeepSeek API key is required'),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com'),
});

export type OptimizationRequestInput = z.infer<typeof optimizationRequestSchema>;
export type OptimizationResponseOutput = z.infer<typeof optimizationResponseSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type EnvConfig = z.infer<typeof envSchema>;