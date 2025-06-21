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

const icdCodeSchema = z.object({
  code: z.string(),
  description: z.string(),
  confidence: z.number(),
  category: z.string().optional(),
})

export const optimizationResponseSchema = z.object({
  success: z.boolean(),
  pdx: icdCodeSchema.optional(),
  sdx: z.array(icdCodeSchema).optional(),
  estimatedAdjRw: z.number().optional(),
  confidenceLevel: z.string().optional(),
  primaryWeight: z.number().optional(),
  secondaryWeight: z.number().optional(),
  complexityFactor: z.number().optional(),
  recommendations: z.array(z.string()).max(3).optional(),
  errorMessage: z.string().optional(),
});

export const adjRwRequestSchema = z.object({
  pdx: z.string().min(1, 'Primary diagnosis is required'),
  sdx: z
    .array(z.string().min(1, 'Code cannot be empty'))
    .max(15, 'Too many secondary diagnoses'),
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
export type AdjRwRequestInput = z.infer<typeof adjRwRequestSchema>;
export type EnvConfig = z.infer<typeof envSchema>;
export const icdSuggestionRequestSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
});

export const codeDescriptionSchema = z.object({
  code: z.string(),
  description: z.string(),
});

export const icdSuggestionResponseSchema = z.object({
  icd10: z.array(codeDescriptionSchema),
  icd9: z.array(codeDescriptionSchema),
});

export type IcdSuggestionRequestInput = z.infer<typeof icdSuggestionRequestSchema>;
export type IcdSuggestionResponseOutput = z.infer<typeof icdSuggestionResponseSchema>;
