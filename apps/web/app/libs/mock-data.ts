import type { IcdCode } from "./types"

const mockIcdCodes: IcdCode[] = [
  {
    code: "J44.1",
    description: "Chronic obstructive pulmonary disease with acute exacerbation",
    confidence: 0.95,
    category: "Respiratory System",
  },
  {
    code: "I25.10",
    description: "Atherosclerotic heart disease of native coronary artery without angina pectoris",
    confidence: 0.88,
    category: "Circulatory System",
  },
  {
    code: "E11.9",
    description: "Type 2 diabetes mellitus without complications",
    confidence: 0.92,
    category: "Endocrine System",
  },
  {
    code: "M79.3",
    description: "Panniculitis, unspecified",
    confidence: 0.75,
    category: "Musculoskeletal System",
  },
  {
    code: "K59.00",
    description: "Constipation, unspecified",
    confidence: 0.82,
    category: "Digestive System",
  },
  {
    code: "R06.02",
    description: "Shortness of breath",
    confidence: 0.9,
    category: "Symptoms and Signs",
  },
  {
    code: "Z51.11",
    description: "Encounter for antineoplastic chemotherapy",
    confidence: 0.85,
    category: "Healthcare Encounters",
  },
  {
    code: "F32.9",
    description: "Major depressive disorder, single episode, unspecified",
    confidence: 0.78,
    category: "Mental Health",
  },
  {
    code: "N18.6",
    description: "End stage renal disease",
    confidence: 0.87,
    category: "Genitourinary System",
  },
  {
    code: "L89.90",
    description: "Pressure ulcer of unspecified site, unspecified stage",
    confidence: 0.73,
    category: "Skin and Subcutaneous Tissue",
  },
]

export function mockIcdSearch(query: string): IcdCode[] {
  const keywords = query.toLowerCase().split(" ")

  return mockIcdCodes
    .map((code) => {
      let confidence = 0
      const description = code.description.toLowerCase()

      // Simple keyword matching algorithm
      keywords.forEach((keyword) => {
        if (description.includes(keyword)) {
          confidence += 0.3
        }
      })

      // Boost confidence for exact matches
      if (keywords.some((keyword) => description.includes(keyword))) {
        confidence = Math.min(confidence + 0.2, 1.0)
      }

      return {
        ...code,
        confidence: Math.max(confidence, code.confidence * 0.5),
      }
    })
    .filter((code) => code.confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8) // Return top 8 matches
}
