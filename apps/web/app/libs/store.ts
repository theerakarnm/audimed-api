import { create } from "zustand"
import type { IcdCode, DiagnosisState, PatientInfo, IcdSuggestionResponse } from "./types"
import { apiGet } from "./http"
import { icd10 } from '../../../api/src/utils/db/schema';

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  diagnosisText: "",
  icd10Suggestions: [],
  icd9Suggestions: [],
  selectedCodes: [],
  isSearchingIcd10: false,
  isSearchingIcd9: false,
  icd10Error: null,
  icd9Error: null,
  rankedCodes: [],
  patientInfo: {
    patientId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: undefined,
    gender: "",
    mrn: "",
    phone: "",
    email: "",
  },

  setDiagnosisText: (text: string) => set({ diagnosisText: text }),

  searchIcdCodes: async (text: string) => {
    set({ isSearchingIcd10: true, icd10Error: null, icd9Error: null });
    try {
      const data = await apiGet<IcdSuggestionResponse>("/suggest-icd", {
        params: { diagnosis: text },
      });

      const icd10Suggestions: IcdCode[] = (data.icd10 ?? []).map((c) => ({
        code: c.code,
        description: c.description,
        confidence: 1.0,
        category: "icd10",
      }));

      set({ icd10Suggestions, isSearchingIcd10: false });

      set({ isSearchingIcd9: true });
      try {
        const dataIcd9 = await apiGet<IcdCode[]>("/suggest-icd-9", {
          params: { icd10Codes: icd10Suggestions.map((c) => c.code).join(",") },
        });

        const icd9Suggestions: IcdCode[] = (dataIcd9 ?? []).map((c) => ({
          code: c.code,
          description: c.description,
          confidence: 1.0,
          category: "icd9",
        }));

        set({ icd9Suggestions, isSearchingIcd9: false });
      } catch (error) {
        console.error("Failed to fetch ICD-9 suggestions", error);
        set({ isSearchingIcd9: false, icd9Error: "Failed to load ICD-9 suggestions." });
      }
    } catch (error) {
      console.error("Failed to fetch ICD-10 suggestions", error);
      set({ isSearchingIcd10: false, icd10Error: "Failed to load ICD-10 suggestions." });
    }
  },

  addSelectedCode: (code: IcdCode) => {
    const { selectedCodes } = get()
    if (!selectedCodes.find((selected) => selected.code === code.code)) {
      console.log(code);

      set({ selectedCodes: [...selectedCodes, code] })
    }
  },

  removeSelectedCode: (codeToRemove: string) => {
    const { selectedCodes, rankedCodes } = get()
    set({
      selectedCodes: selectedCodes.filter((code) => code.code !== codeToRemove),
      rankedCodes: rankedCodes.filter((code) => code.code !== codeToRemove),
    })
  },

  setRankedCodes: (codes: (IcdCode & { rank: number })[]) => {
    set({ rankedCodes: codes })
  },

  setPatientInfo: (info: PatientInfo) => set({ patientInfo: info }),

  isPatientInfoComplete: () => {
    const { patientInfo } = get()
    return !!(patientInfo.patientId && patientInfo.firstName && patientInfo.lastName && patientInfo.dateOfBirth)
  },

  recalculateRanking: () => {
    const { selectedCodes } = get()
    if (selectedCodes.length === 0) return

    // Sort by confidence score (highest first) and then by category priority
    const categoryPriority: Record<string, number> = {
      "Circulatory System": 1,
      "Respiratory System": 2,
      "Endocrine System": 3,
      "Mental Health": 4,
      "Genitourinary System": 5,
      "Musculoskeletal System": 6,
      "Digestive System": 7,
      "Skin and Subcutaneous Tissue": 8,
      "Healthcare Encounters": 9,
      "Symptoms and Signs": 10,
      Custom: 11,
    }

    const sortedCodes = [...selectedCodes].sort((a, b) => {
      // First sort by confidence (higher is better)
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence
      }

      // Then sort by category priority (lower number is higher priority)
      const aPriority = categoryPriority[a.category || "Custom"] || 99
      const bPriority = categoryPriority[b.category || "Custom"] || 99
      return aPriority - bPriority
    })

    const rankedCodes = sortedCodes.map((code, index) => ({
      ...code,
      rank: index + 1,
    }))

    set({ rankedCodes })
  },
}))
