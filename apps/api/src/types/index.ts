/**
 * Core type definitions for the Healthcare DRG Optimization API
 */

/**
 * ICD-10 code structure returned by the API
 */
export interface IcdCode {
  code: string
  description: string
  confidence: number
  category?: string
}

/**
 * Optimization request payload
 */
export interface OptimizationRequest {
  /** Available ICD-10 codes to select from */
  availableCodes: string[];
  /** CSV data as string containing historical cases */
  datasetCsv?: string;
  /** Maximum number of secondary diagnoses to include */
  maxSecondaryDiagnoses?: number;
}

export interface AdjRwResult {
  /** Estimated adjusted Relative Weight */
  estimatedAdjRw?: number;
  /** Confidence level of the optimization */
  confidenceLevel?: string;
  /** Calculated weight of the primary diagnosis */
  primaryWeight?: number;
  /** Combined weight of the secondary diagnoses */
  secondaryWeight?: number;
  /** Overall complexity adjustment factor */
  complexityFactor?: number;
  /** List of additional recommendations */
  recommendations?: string[];
}

/**
 * Request payload for Adj RW evaluation of a specific code order
 */
export interface AdjRwRequest {
  /** Primary diagnosis code */
  pdx: string;
  /** Ordered list of secondary diagnosis codes */
  sdx: string[];
}

/**
 * Optimization response payload
 */
export interface OptimizationResponse extends AdjRwResult {
  /** Whether the optimization was successful */
  success: boolean;
  /** Selected primary diagnosis code */
  pdx?: IcdCode;
  /** Selected secondary diagnosis codes */
  sdx?: IcdCode[];
  /** Error message if optimization failed */
  errorMessage?: string;
}

/**
 * Dataset case row structure
 */
export interface DatasetCase {
  caseId?: string | number;
  adjRw: number;
  pdx: string;
  [key: string]: string | number | undefined; // For dynamic sdx columns
}

/**
 * DeepSeek API message structure
 */
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * DeepSeek API response structure
 */
export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * DeepSeek optimization result
 */
export interface DeepSeekOptimizationResult {
  pdx: string;
  sdx: string[];
  estimatedAdjRw: number;
  confidenceLevel: string;
  primaryWeight: number;
  secondaryWeight: number;
  complexityFactor: number;
  recommendations: string[];
}

/**
 * API Error response structure
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  apiStatus: string;
  deepseekStatus: string;
  timestamp: string;
  error?: string;
}