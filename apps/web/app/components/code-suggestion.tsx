
"use client"

import { useState } from "react"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { Search, Plus, X, Loader2, Check } from "lucide-react"
import { useDiagnosisStore } from "~/hooks/store/useDiagnosisStore"
import { toast } from "~/hooks/use-toast"
import type { IcdCode } from "~/libs/types"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

interface DiagnosisWindow {
  id: number
  text: string
  icd10Suggestions: IcdCode[]
  isSearching: boolean
}

export function CodeSuggestion() {
  const {
    searchIcd10,
    searchIcd9,
    isSearchingIcd10,
    isSearchingIcd9,
    icd9Suggestions,
    icd9Error,
    addSelectedCode,
    removeSelectedCode,
    selectedCodes,
  } = useDiagnosisStore()

  const [diagnosisWindows, setDiagnosisWindows] = useState<DiagnosisWindow[]>([
    { id: 1, text: "", icd10Suggestions: [], isSearching: false },
  ])

  const handleAddWindow = () => {
    setDiagnosisWindows([
      ...diagnosisWindows,
      { id: Date.now(), text: "", icd10Suggestions: [], isSearching: false },
    ])
  }

  const handleRemoveWindow = (id: number) => {
    setDiagnosisWindows(diagnosisWindows.filter((window) => window.id !== id))
  }

  const handleTextChange = (id: number, text: string) => {
    setDiagnosisWindows(
      diagnosisWindows.map((window) =>
        window.id === id ? { ...window, text } : window
      )
    )
  }

  const handleSearchIcd10 = async (id: number, text: string) => {
    if (!text.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter patient symptoms or diagnosis description.",
        variant: "destructive",
      })
      return
    }

    setDiagnosisWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, isSearching: true } : window
      )
    )

    try {
      const suggestions = await searchIcd10(text)
      setDiagnosisWindows((prevWindows) =>
        prevWindows.map((window) =>
          window.id === id ? { ...window, icd10Suggestions: suggestions, isSearching: false } : window
        )
      )
    } catch (error) {
      setDiagnosisWindows((prevWindows) =>
        prevWindows.map((window) =>
          window.id === id ? { ...window, isSearching: false } : window
        )
      )
      toast({
        title: "Search Failed",
        description: "Unable to generate ICD-10 code suggestions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearchIcd9 = async () => {
    const allIcd10Codes = diagnosisWindows.flatMap(
      (window) => window.icd10Suggestions
    )
    if (allIcd10Codes.length === 0) {
      toast({
        title: "ICD-10 Codes Required",
        description: "Please search for and select at least one ICD-10 code.",
        variant: "destructive",
      })
      return
    }
    try {
      await searchIcd9(allIcd10Codes.map((code) => code.code))
      toast({
        title: "Search Complete",
        description: "ICD-9 code suggestions have been generated.",
      })
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to generate ICD-9 code suggestions. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  const renderIcd10List = (list: IcdCode[]) => (
    <div className="space-y-1">
      {list.map((icdCode) => (
        <div
          key={icdCode.code}
          className={`
            flex items-center justify-between p-2 rounded border transition-all duration-200
            ${isCodeSelected(icdCode.code)
              ? "bg-green-50 border-green-200"
              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
            <Badge
              variant="outline"
              className={`
                font-mono text-xs shrink-0 px-1.5 py-0.5
                ${isCodeSelected(icdCode.code)
                  ? "border-green-600 text-green-700 bg-green-100"
                  : "border-gray-300 text-gray-600"
                }
              `}
            >
              {icdCode.code}
            </Badge>
            {isCodeSelected(icdCode.code) && <Check className="w-3 h-3 text-green-600 shrink-0" />}
            <span
              className={`
                text-sm truncate
                ${isCodeSelected(icdCode.code) ? "text-green-900 font-medium" : "text-gray-700"}
              `}
              title={icdCode.description}
            >
              {icdCode.description}
            </span>
          </div>

          <Button
            onClick={() => handleToggleCode(icdCode)}
            size="sm"
            variant={isCodeSelected(icdCode.code) ? "outline" : "default"}
            className={`
              shrink-0 h-7 px-2 text-xs
              ${isCodeSelected(icdCode.code)
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {isCodeSelected(icdCode.code) ? (
              <>
                <X className="w-3 h-3 mr-1" />
                Remove
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Select
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )

  const renderIcd9List = (list: IcdCode[]) => (
    <div className="space-y-1">
      {list.map((icdCode) => (
        <div
          key={icdCode.code}
          className={`
            flex items-center justify-between p-2 rounded border transition-all duration-200
            ${isCodeSelected(icdCode.code)
              ? "bg-green-50 border-green-200"
              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
            <Badge
              variant="outline"
              className={`
                font-mono text-xs shrink-0 px-1.5 py-0.5
                ${isCodeSelected(icdCode.code)
                  ? "border-green-600 text-green-700 bg-green-100"
                  : "border-gray-300 text-gray-600"
                }
              `}
            >
              {icdCode.code}
            </Badge>
            {isCodeSelected(icdCode.code) && <Check className="w-3 h-3 text-green-600 shrink-0" />}
            <span
              className={`
                text-sm truncate
                ${isCodeSelected(icdCode.code) ? "text-green-900 font-medium" : "text-gray-700"}
              `}
              title={icdCode.description}
            >
              {icdCode.description}
            </span>
          </div>

          <Button
            onClick={() => handleToggleCode(icdCode)}
            size="sm"
            variant={isCodeSelected(icdCode.code) ? "outline" : "default"}
            className={`
              shrink-0 h-7 px-2 text-xs
              ${isCodeSelected(icdCode.code)
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {isCodeSelected(icdCode.code) ? (
              <>
                <X className="w-3 h-3 mr-1" />
                Remove
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Select
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-xl text-gray-500 font-semibold">Code Suggestion</h3>
      {diagnosisWindows.map((window, index) => (
        <div key={window.id} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Diagnosis #{index + 1}</h4>
            {diagnosisWindows.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveWindow(window.id)}
              >
                <X className="w-4 h-4 text-black" />
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Enter patient symptoms or diagnosis description..."
            value={window.text}
            onChange={(e) => handleTextChange(window.id, e.target.value)}
            className="min-h-[100px] text-base resize-none"
          />
          <Button
            onClick={() => handleSearchIcd10(window.id, window.text)}
            disabled={window.isSearching}
          >
            {window.isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search ICD-10
              </>
            )}
          </Button>
          {window.icd10Suggestions.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2">ICD-10 Suggestions</h5>
              {renderIcd10List(window.icd10Suggestions)}
            </div>
          )}
        </div>
      ))}
      <div className="flex space-x-4">
        <Button onClick={handleAddWindow}>
          <Plus className="w-5 h-5 mr-2" />
          Add Diagnosis
        </Button>
        <Button
          onClick={handleSearchIcd9}
          disabled={isSearchingIcd9}
          className="bg-gradient-to-r from-green-500 to-green-600"
        >
          {isSearchingIcd9 ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Searching ICD-9...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Run ICD-9 Suggestion
            </>
          )}
        </Button>
      </div>
      {icd9Suggestions.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl text-gray-500 font-semibold mb-4">
            ICD-9 Suggestions
          </h3>
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
          ) : (
            renderIcd9List(icd9Suggestions)
          )}
        </div>
      )}
    </div>
  )
}
