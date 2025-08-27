
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
  selectedIcd10Codes: IcdCode[]
  isSearching: boolean
}

export function CodeSuggestion() {
  const {
    searchIcd10,
    searchIcd9,
    searchIcd9Grouped,
    isSearchingIcd10,
    isSearchingIcd9,
    icd9Suggestions,
    groupedIcd9Suggestions,
    icd9Error,
    addSelectedCode,
    removeSelectedCode,
    selectedCodes,
  } = useDiagnosisStore()

  const [diagnosisWindows, setDiagnosisWindows] = useState<DiagnosisWindow[]>([
    { id: 1, text: "", icd10Suggestions: [], selectedIcd10Codes: [], isSearching: false },
  ])

  const handleAddWindow = () => {
    setDiagnosisWindows([
      ...diagnosisWindows,
      { id: Date.now(), text: "", icd10Suggestions: [], selectedIcd10Codes: [], isSearching: false },
    ])
  }

  const handleRemoveWindow = (id: number) => {
    const windowToRemove = diagnosisWindows.find((window) => window.id === id)
    if (windowToRemove) {
      // Remove all selected ICD-10 codes from this window from the global store
      windowToRemove.selectedIcd10Codes.forEach((code) => {
        removeSelectedCode(code.code)
      })
    }
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
    const diagnosisGroups = diagnosisWindows
      .filter((window) => window.selectedIcd10Codes.length > 0)
      .map((window) => ({
        diagnosisId: window.id,
        diagnosisText: window.text,
        icd10Codes: window.selectedIcd10Codes.map((code) => code.code)
      }))
    
    if (diagnosisGroups.length === 0) {
      toast({
        title: "ICD-10 Codes Required",
        description: "Please search for and select at least one ICD-10 code.",
        variant: "destructive",
      })
      return
    }
    
    try {
      await searchIcd9Grouped(diagnosisGroups)
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

  const isCodeSelectedInWindow = (windowId: number, code: string) => {
    const window = diagnosisWindows.find((w) => w.id === windowId)
    return window?.selectedIcd10Codes.some((selected) => selected.code === code) || false
  }

  const isCodeSelected = (code: string) => {
    return selectedCodes.some((selected) => selected.code === code)
  }

  const handleToggleIcd10Code = (windowId: number, icdCode: IcdCode) => {
    setDiagnosisWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.id !== windowId) return window
        
        const isSelected = window.selectedIcd10Codes.some((selected) => selected.code === icdCode.code)
        if (isSelected) {
          // Remove from window's selected codes
          removeSelectedCode(icdCode.code)
          return {
            ...window,
            selectedIcd10Codes: window.selectedIcd10Codes.filter((code) => code.code !== icdCode.code)
          }
        } else {
          // Add to window's selected codes and global store
          addSelectedCode(icdCode)
          return {
            ...window,
            selectedIcd10Codes: [...window.selectedIcd10Codes, icdCode]
          }
        }
      })
    )
  }

  const handleToggleCode = (icdCode: IcdCode) => {
    if (isCodeSelected(icdCode.code)) {
      removeSelectedCode(icdCode.code)
    } else {
      addSelectedCode(icdCode)
    }
  }

  const renderIcd10List = (windowId: number, list: IcdCode[]) => (
    <div className="space-y-1">
      {list.map((icdCode) => (
        <div
          key={icdCode.code}
          className={`
            flex items-center justify-between p-2 rounded border transition-all duration-200
            ${isCodeSelectedInWindow(windowId, icdCode.code)
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
                ${isCodeSelectedInWindow(windowId, icdCode.code)
                  ? "border-green-600 text-green-700 bg-green-100"
                  : "border-gray-300 text-gray-600"
                }
              `}
            >
              {icdCode.code}
            </Badge>
            {isCodeSelectedInWindow(windowId, icdCode.code) && <Check className="w-3 h-3 text-green-600 shrink-0" />}
            <span
              className={`
                text-sm truncate
                ${isCodeSelectedInWindow(windowId, icdCode.code) ? "text-green-900 font-medium" : "text-gray-700"}
              `}
              title={icdCode.description}
            >
              {icdCode.description}
            </span>
          </div>

          <Button
            onClick={() => handleToggleIcd10Code(windowId, icdCode)}
            size="sm"
            variant={isCodeSelectedInWindow(windowId, icdCode.code) ? "outline" : "default"}
            className={`
              shrink-0 h-7 px-2 text-xs
              ${isCodeSelectedInWindow(windowId, icdCode.code)
                ? "border-red-300 text-red-700 hover:bg-red-50"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {isCodeSelectedInWindow(windowId, icdCode.code) ? (
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
              {renderIcd10List(window.id, window.icd10Suggestions)}
            </div>
          )}
          {window.selectedIcd10Codes.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2 text-green-700">Selected ICD-10 Codes ({window.selectedIcd10Codes.length})</h5>
              <div className="flex flex-wrap gap-1">
                {window.selectedIcd10Codes.map((code) => (
                  <Badge key={code.code} variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
                    {code.code}
                  </Badge>
                ))}
              </div>
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
      {(groupedIcd9Suggestions.length > 0 || icd9Suggestions.length > 0) && (
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
          ) : groupedIcd9Suggestions.length > 0 ? (
            <div className="space-y-6">
              {groupedIcd9Suggestions.map((group, index) => (
                <div key={group.diagnosisId} className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg text-gray-700">
                      Diagnosis #{diagnosisWindows.findIndex(w => w.id === group.diagnosisId) + 1}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 truncate" title={group.diagnosisText}>{group.diagnosisText}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {group.icd10Codes.map((code) => (
                        <Badge key={code} variant="secondary" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {group.icd9Suggestions.length > 0 ? (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        ICD-9 Suggestions ({group.icd9Suggestions.length})
                      </h5>
                      {renderIcd9List(group.icd9Suggestions)}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No ICD-9 suggestions found for this diagnosis.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            renderIcd9List(icd9Suggestions)
          )}
        </div>
      )}
    </div>
  )
}
