import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useDiagnosisStore } from "~/libs/store"
import type { IcdCode } from "~/libs/types"
import { Skeleton } from "~/components/ui/skeleton"

export function IcdSuggestions() {
  const {
    icd10Suggestions,
    icd9Suggestions,
    addSelectedCode,
    removeSelectedCode,
    selectedCodes,
    isSearchingIcd10,
    isSearchingIcd9,
    icd10Error,
    icd9Error,
  } = useDiagnosisStore()

  const isCodeSelected = (code: string) => {
    return selectedCodes.some((selected) => selected.code === code)
  }

  const handleToggleCode = (icdCode: IcdCode) => {
    if (isCodeSelected(icdCode.code)) {
      removeSelectedCode(icdCode.code)
    } else {
      addSelectedCode(icdCode)
    }
  }

  const renderGrid = (list: IcdCode[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.map((suggestion) => (
        <Card
          key={suggestion.code}
          className={`transition-all hover:shadow-md ${isCodeSelected(suggestion.code) ? "ring-2 ring-green-500 bg-green-50" : "hover:border-[#115ad4]/50"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline" className="font-mono text-sm">
                {suggestion.code}
              </Badge>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4 line-clamp-2">{suggestion.description}</h3>

            <Button
              onClick={() => handleToggleCode(suggestion)}
              className="w-full"
              variant={isCodeSelected(suggestion.code) ? "secondary" : "default"}
            >
              {isCodeSelected(suggestion.code) ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Remove Code
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (icd10Suggestions.length === 0 && icd9Suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ICD code suggestions found. Try refining your diagnosis description.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6 mb-6">
        <h3 className="text-xl text-gray-500 font-semibold mb-4">ICD-10 Codes</h3>
        {isSearchingIcd10 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-1/4 mb-3" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : icd10Error ? (
          <p className="text-red-500">{icd10Error}</p>
        ) : icd10Suggestions.length > 0 ? (
          renderGrid(icd10Suggestions)
        ) : (
          <p className="text-gray-500">No ICD-10 suggestions found.</p>
        )}
      </div>
      <div>
        <h3 className="text-xl text-gray-500 font-semibold mb-4">ICD-9 Codes</h3>
        {isSearchingIcd9 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-1/4 mb-3" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : icd9Error ? (
          <p className="text-red-500">{icd9Error}</p>
        ) : icd9Suggestions.length > 0 ? (
          renderGrid(icd9Suggestions)
        ) : (
          <p className="text-gray-500">No ICD-9 suggestions found.</p>
        )}
      </div>
    </div>
  )
}
