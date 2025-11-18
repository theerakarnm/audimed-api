export interface AdjRwResult {
  estimatedAdjRw: number
  confidenceLevel: number
  primaryWeight: number
  secondaryWeight: number
  complexityFactor: number
  recommendations: string[]
  drgName: string;  
}


export function getAdjRwGrade(efficiency: number): string {
  if (efficiency >= 0.9) return "A+"
  if (efficiency >= 0.8) return "A"
  if (efficiency >= 0.7) return "B+"
  if (efficiency >= 0.6) return "B"
  if (efficiency >= 0.5) return "C+"
  if (efficiency >= 0.4) return "C"
  return "D"
}
