import type { IcdCode } from "./types"

export interface AdjRwResult {
  estimatedAdjRw: number
  confidenceLevel: number
  primaryWeight: number
  secondaryWeight: number
  complexityFactor: number
  recommendations: string[]
}

// Mock DRG weights for different ICD-10 categories
const categoryWeights: Record<string, number> = {
  "Respiratory System": 1.2,
  "Circulatory System": 1.5,
  "Endocrine System": 1.1,
  "Musculoskeletal System": 0.9,
  "Digestive System": 1.0,
  "Symptoms and Signs": 0.7,
  "Healthcare Encounters": 0.8,
  "Mental Health": 1.3,
  "Genitourinary System": 1.2,
  "Skin and Subcutaneous Tissue": 0.8,
  Custom: 1.0,
}

// Base weights for different types of diagnoses
const baseWeights: Record<string, number> = {
  primary: 2.5,
  secondary: 0.8,
}

export function calculateAdjRw(rankedCodes: (IcdCode & { rank: number })[]): AdjRwResult {
  if (rankedCodes.length === 0) {
    return {
      estimatedAdjRw: 0,
      confidenceLevel: 0,
      primaryWeight: 0,
      secondaryWeight: 0,
      complexityFactor: 0,
      recommendations: [],
    }
  }

  const primaryDiagnosis = rankedCodes[0]
  const secondaryDiagnoses = rankedCodes.slice(1)

  // Calculate primary diagnosis weight
  const primaryCategoryWeight = categoryWeights[primaryDiagnosis.category || "Custom"] || 1.0
  const primaryWeight = baseWeights.primary * primaryCategoryWeight * primaryDiagnosis.confidence

  // Calculate secondary diagnoses weight
  const secondaryWeight = secondaryDiagnoses.reduce((total, diagnosis) => {
    const categoryWeight = categoryWeights[diagnosis.category || "Custom"] || 1.0
    const positionFactor = Math.max(0.5, 1 - (diagnosis.rank - 2) * 0.1) // Diminishing weight by position
    return total + baseWeights.secondary * categoryWeight * diagnosis.confidence * positionFactor
  }, 0)

  // Calculate complexity factor based on number and diversity of diagnoses
  const uniqueCategories = new Set(rankedCodes.map((code) => code.category || "Custom")).size
  const complexityFactor = Math.min(2.0, 1 + (uniqueCategories - 1) * 0.2 + rankedCodes.length * 0.05)

  // Calculate total score
  const estimatedAdjRw = (primaryWeight + secondaryWeight) * complexityFactor

  // Calculate efficiency (0-1 scale)
  const maxPossibleScore =
    baseWeights.primary * 1.5 * 1.0 + (rankedCodes.length - 1) * baseWeights.secondary * 1.5 * 1.0
  const confidenceLevel = Math.min(1.0, estimatedAdjRw / (maxPossibleScore * complexityFactor))

  // Generate recommendations
  const recommendations: string[] = []

  if (primaryDiagnosis.confidence < 0.8) {
    recommendations.push("Consider reviewing primary diagnosis - confidence score is below optimal threshold")
  }

  if (secondaryDiagnoses.length > 8) {
    recommendations.push("Consider consolidating secondary diagnoses - too many may dilute clinical focus")
  }

  if (uniqueCategories === 1 && rankedCodes.length > 3) {
    recommendations.push("All diagnoses are from the same category - consider if additional categories apply")
  }

  const lowConfidenceCodes = rankedCodes.filter((code) => code.confidence < 0.6).length
  if (lowConfidenceCodes > 0) {
    recommendations.push(`${lowConfidenceCodes} diagnosis(es) have low confidence - review clinical documentation`)
  }

  if (confidenceLevel < 0.6) {
    recommendations.push(
      "Overall ranking efficiency is below optimal - consider reordering diagnoses by clinical priority",
    )
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent diagnosis ranking - well-aligned with clinical best practices")
  }

  return {
    estimatedAdjRw,
    confidenceLevel,
    primaryWeight,
    secondaryWeight,
    complexityFactor,
    recommendations,
  }
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
