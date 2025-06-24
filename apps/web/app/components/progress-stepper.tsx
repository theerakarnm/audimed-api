"use client"

import { Check } from "lucide-react"
import { useDiagnosisStore } from "~/libs/store"
import { cn } from "~/libs/utils"

export function ProgressStepper() {
  const {
    isPatientInfoComplete,
    icd10Suggestions,
    icd9Suggestions,
    selectedCodes,
    rankedCodes,
  } = useDiagnosisStore()

  let currentStep = 1
  if (isPatientInfoComplete()) currentStep = 2
  if (icd10Suggestions.length > 0 || icd9Suggestions.length > 0) currentStep = 3
  if (selectedCodes.length > 0) currentStep = 4
  if (rankedCodes.length > 0) currentStep = 5

  const steps = [
    "Patient Info",
    "Diagnosis Input",
    "Code Suggestions",
    "Diagnosis Ranking",
    "Export",
  ]

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex flex-wrap gap-4">
        {steps.map((label, index) => {
          const step = index + 1
          const isCompleted = step < currentStep
          const isActive = step === currentStep
          return (
            <li key={label} className="flex items-center">
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium mr-2",
                  {
                    "bg-[#115ad4] text-white border-[#115ad4]": isActive,
                    "bg-green-500 text-white border-green-500": isCompleted,
                    "bg-gray-200 text-gray-700 border-gray-300": !isActive && !isCompleted,
                  },
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </span>
              <span
                className={cn("text-sm font-medium", {
                  "text-gray-900": isActive,
                  "text-gray-500": !isActive,
                })}
              >
                {label}
              </span>
              {step < steps.length && <span className="mx-2 text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
