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

export interface DiagnosisState {
  diagnosisText: string
  icd10Suggestions: IcdCode[]
  icd9Suggestions: IcdCode[]
  selectedCodes: IcdCode[]
  rankedCodes: (IcdCode & { rank: number })[]
  patientInfo: PatientInfo

  setDiagnosisText: (text: string) => void
  searchIcdCodes: (text: string) => Promise<void>
  addSelectedCode: (code: IcdCode) => void
  removeSelectedCode: (code: string) => void
  setRankedCodes: (codes: (IcdCode & { rank: number })[]) => void
  setPatientInfo: (info: PatientInfo) => void
  isPatientInfoComplete: () => boolean
  recalculateRanking: () => void
}
