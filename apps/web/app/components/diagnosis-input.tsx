"use client"

import { useState } from "react"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { useDiagnosisStore } from "~/libs/store"
import { toast } from "~/hooks/use-toast"

export function DiagnosisInput() {
  const { diagnosisText, setDiagnosisText, searchIcdCodes } = useDiagnosisStore()
  const [isSearching, setIsSearching] = useState(false)
  const maxLength = 2000

  const handleSearch = async () => {
    if (!diagnosisText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter patient symptoms or diagnosis description.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      await searchIcdCodes(diagnosisText)
      toast({
        title: "Search Complete",
        description: "ICD-10 and ICD-9 code suggestions have been generated.",
      })
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to generate ICD code suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Enter patient symptoms or diagnosis description..."
          value={diagnosisText}
          onChange={(e) => setDiagnosisText(e.target.value)}
          className="min-h-[200px] text-base resize-none focus:ring-2 focus:ring-[#115ad4] focus:border-transparent"
          maxLength={maxLength}
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-500">
          {diagnosisText.length}/{maxLength}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSearch}
          disabled={isSearching || !diagnosisText.trim()}
          className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90 px-8 py-2 text-base font-medium"
          size="lg"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Searching ICD Codes...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Search ICD Codes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
