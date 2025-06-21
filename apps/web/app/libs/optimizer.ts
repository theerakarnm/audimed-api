import { apiPost } from './http'
import type { IcdCode } from './types'

export interface OptimizationRequest {
  availableCodes: string[]
  maxSecondaryDiagnoses?: number
}

export interface OptimizationResponse {
  success: boolean
  pdx?: IcdCode
  sdx?: IcdCode[]
  estimatedAdjRw?: number
  confidenceLevel?: string
  primaryWeight?: number
  secondaryWeight?: number
  complexityFactor?: number
  recommendations?: string[]
  errorMessage?: string
}

export async function optimizeDiagnosis(
  req: OptimizationRequest,
): Promise<OptimizationResponse> {
  return apiPost<OptimizationResponse>('/optimize', req)
}
