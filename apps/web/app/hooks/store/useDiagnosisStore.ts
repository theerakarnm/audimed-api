import { create } from "zustand"
import type { IcdCode, DiagnosisState, PatientInfo, IcdSuggestionResponse, GroupedIcd9Suggestions } from "../../libs/types"
import { apiGet } from "../../libs/http"

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  icd9Suggestions: [],
  groupedIcd9Suggestions: [],
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
    age: 0,
    lengthOfStay: undefined,
    admitDate: undefined,
    lengthOfStayDisplay: undefined,
  },

  searchIcd10: async (text: string) => {
    set({ isSearchingIcd10: true, icd10Error: null });
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
      set({ isSearchingIcd10: false });
      return icd10Suggestions;
    } catch (error) {
      console.error("Failed to fetch ICD-10 suggestions", error);
      set({ isSearchingIcd10: false, icd10Error: "Failed to load ICD-10 suggestions." });
      throw error;
    }
  },

  searchIcd9: async (icd10Codes: string[]) => {
    set({ isSearchingIcd9: true, icd9Error: null });
    try {
      const dataIcd9 = await apiGet<IcdCode[]>("/suggest-icd-9", {
        params: { icd10Codes: icd10Codes.join(",") },
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
  },

  searchIcd9Grouped: async (diagnosisGroups: { diagnosisId: number; diagnosisText: string; icd10Codes: string[] }[]) => {
    set({ isSearchingIcd9: true, icd9Error: null, groupedIcd9Suggestions: [] });

    try {
      const groupedResults: GroupedIcd9Suggestions[] = [];

      for (const group of diagnosisGroups) {
        if (group.icd10Codes.length === 0) continue;

        try {
          const dataIcd9 = await apiGet<IcdCode[]>("/suggest-icd-9", {
            params: { icd10Codes: group.icd10Codes.join(",") },
          });

          const icd9Suggestions: IcdCode[] = (dataIcd9 ?? []).map((c) => ({
            code: c.code,
            description: c.description,
            confidence: 1.0,
            category: "icd9",
          }));

          groupedResults.push({
            diagnosisId: group.diagnosisId,
            diagnosisText: group.diagnosisText,
            icd10Codes: group.icd10Codes,
            icd9Suggestions,
          });
        } catch (error) {
          console.error(`Failed to fetch ICD-9 suggestions for diagnosis ${group.diagnosisId}`, error);
          groupedResults.push({
            diagnosisId: group.diagnosisId,
            diagnosisText: group.diagnosisText,
            icd10Codes: group.icd10Codes,
            icd9Suggestions: [],
          });
        }
      }

      const allIcd9Suggestions = groupedResults.flatMap(group => group.icd9Suggestions);
      set({
        groupedIcd9Suggestions: groupedResults,
        icd9Suggestions: allIcd9Suggestions,
        isSearchingIcd9: false
      });
    } catch (error) {
      console.error("Failed to fetch grouped ICD-9 suggestions", error);
      set({ isSearchingIcd9: false, icd9Error: "Failed to load ICD-9 suggestions." });
    }
  },

  addSelectedCode: (code: IcdCode) => {
    const { selectedCodes } = get()
    if (!selectedCodes.find((selected) => selected.code === code.code)) {
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

      if (b.confidence !== a.confidence) {
        return (b.confidence ?? 0) - (a.confidence ?? 0)
      }

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
  clearAll: () => {
    set({
      selectedCodes: [],
      rankedCodes: [],
      icd9Suggestions: [],
      groupedIcd9Suggestions: [],
    });
  },
}))
