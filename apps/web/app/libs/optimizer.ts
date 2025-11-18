import { apiPost } from './http'

export interface OptimizationRequest {
  items: string[],
  gender: 'male' | 'female',
  age: number,
  lengthOfStay: number
}

export interface OptimizationResponse {
  error: string | null
  adjRw: number;
  bestSetup: {
    pdx: string,
    sdx: string[]
  drgName: string;
}              
}

export async function optimizeDiagnosis(
  req: OptimizationRequest, 
): Promise<OptimizationResponse> {
  console.log(req);
  
  return apiPost<OptimizationResponse>('/v2/adjrw', req)
}
