import type { MetaFunction } from "@remix-run/node";
import { DiagnosisInput } from "~/components/diagnosis-input"
import { IcdSuggestions } from "~/components/icd-suggestions"
import { SelectedCodes } from "~/components/selected-codes"
import { RankingInterface } from "~/components/ranking-interface"
import { ExportOptions } from "~/components/export-options"
import { Header } from "~/components/header"
import { PatientInformation } from "~/components/patient-information"
import { useDiagnosisStore } from "~/libs/store"

export const meta: MetaFunction = () => {
  return [
    { title: "AudiMed | Next level of Medical AI" },
    { name: "description", content: "AudiMed | Next level of Medical AI" },
  ];
};

export default function Index() {
  const { diagnosisText, selectedCodes, rankedCodes, isPatientInfoComplete } = useDiagnosisStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Patient Information Section - Always First */}
          <section>
            <PatientInformation />
          </section>

          {/* Diagnosis Input Section - Only show if patient info is complete */}
          {isPatientInfoComplete() && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Patient Diagnosis Input</h2>
              <DiagnosisInput />
            </section>
          )}

          {/* ICD-10 Suggestions - Only show if diagnosis text exists and patient info complete */}
          {isPatientInfoComplete() && diagnosisText && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">ICD-10 Code Suggestions</h2>
              <IcdSuggestions />
            </section>
          )}

          {/* Selected Codes - Only show if codes are selected */}
          {isPatientInfoComplete() && selectedCodes.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selected ICD-10 Codes</h2>
              <SelectedCodes />
            </section>
          )}

          {/* Ranking Interface - Only show if codes are selected */}
          {isPatientInfoComplete() && selectedCodes.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Diagnosis Ranking</h2>
              <RankingInterface />
            </section>
          )}

          {/* Export Options - Only show if codes are ranked */}
          {isPatientInfoComplete() && rankedCodes.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Export Options</h2>
              <ExportOptions />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
