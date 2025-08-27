export interface IcdCode {
  code: string
  description: string
  confidence: number
  category?: string
}

export interface CodeDescription {
  code: string
  description: string
}

export interface IcdSuggestionResponse {
  icd10: CodeDescription[]
  icd9: CodeDescription[]
}

export interface PatientInfo {
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: Date | undefined
  gender: string
  mrn: string
  phone?: string
  email?: string
}

export interface GroupedIcd9Suggestions {
  diagnosisId: number
  diagnosisText: string
  icd10Codes: string[]
  icd9Suggestions: IcdCode[]
}

export interface DiagnosisState {
  icd9Suggestions: IcdCode[]
  groupedIcd9Suggestions: GroupedIcd9Suggestions[]
  selectedCodes: IcdCode[]
  rankedCodes: (IcdCode & { rank: number })[]
  patientInfo: PatientInfo
  isSearchingIcd10: boolean
  isSearchingIcd9: boolean
  icd10Error: string | null
  icd9Error: string | null

  searchIcd10: (text: string) => Promise<IcdCode[]>
  searchIcd9: (icd10Codes: string[]) => Promise<void>
  searchIcd9Grouped: (diagnosisGroups: { diagnosisId: number; diagnosisText: string; icd10Codes: string[] }[]) => Promise<void>
  addSelectedCode: (code: IcdCode) => void
  removeSelectedCode: (code: string) => void
  setRankedCodes: (codes: (IcdCode & { rank: number })[]) => void
  setPatientInfo: (info: PatientInfo) => void
  isPatientInfoComplete: () => boolean
  recalculateRanking: () => void
  clearAll: () => void
}
