"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Skeleton } from "~/components/ui/skeleton"
import { GripVertical, Crown, TrendingUp, Info, Calculator, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { useDiagnosisStore } from "~/hooks/store/useDiagnosisStore"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "~/components/sortable-item"
import { toast } from "~/hooks/use-toast"
import type { AdjRwResult } from "~/libs/adjrw-calculator"
import { optimizeDiagnosis } from "~/libs/optimizer"
import type { IcdCode } from "~/libs/types"

export function RankingInterface() {
  const { selectedCodes, rankedCodes, setRankedCodes } = useDiagnosisStore()
  const [isRankingMode, setIsRankingMode] = useState(false)
  const [adjRwScore, setAdjRwScore] = useState<AdjRwResult | null>(null)
  const [hasManuallyReordered, setHasManuallyReordered] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleStartRanking = () => {
    if (selectedCodes.length === 0) {
      toast({
        title: "No Codes Selected",
        description: "Please select ICD-10 codes before ranking.",
        variant: "destructive",
      })
      return
    }

    // Initialize ranking with selected codes
    const initialRanking = selectedCodes.map((code, index) => ({
      ...code,
      rank: index + 1,
    }))
    setRankedCodes(initialRanking)
    setIsRankingMode(true)
    setAdjRwScore(null)
    setHasManuallyReordered(false)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = rankedCodes.findIndex((code) => code.code === active.id)
      const newIndex = rankedCodes.findIndex((code) => code.code === over.id)

      const newRankedCodes = arrayMove(rankedCodes, oldIndex, newIndex).map((code, index) => ({
        ...code,
        rank: index + 1,
      }))

      setRankedCodes(newRankedCodes)
      setHasManuallyReordered(true)
      setAdjRwScore(null) // Clear AdjRw score after manual reordering
    }
  }

  const handleSaveRanking = () => {
    setIsRankingMode(false)
    toast({
      title: "Ranking Saved",
      description: "Diagnosis ranking has been saved successfully.",
    })
  }

  const handleCalculateAdjRw = async () => {
    if (selectedCodes.length === 0) return

    setIsCalculating(true)

    console.log(selectedCodes);


    try {
      const availableCodes: Record<'availableCodes' | 'availableOptionalCodes', string[]> = {
        availableCodes: [],
        availableOptionalCodes: [],
      }

      for (const code of selectedCodes) {
        if (code.category === 'icd10') {
          availableCodes.availableCodes.push(code.code)
        }
        else if (code.category === 'icd9') {
          availableCodes.availableOptionalCodes.push(code.code)
        }
      }

      const res = await optimizeDiagnosis({
        ...availableCodes,
        maxSecondaryDiagnoses: 12,
      })

      if (!res.success) {
        toast({
          title: "Optimization Failed",
          description: res.errorMessage || "Unable to calculate AdjRw.",
          variant: "destructive",
        })
        return
      }

      const order = [res.pdx, ...(res.sdx || [])].filter(Boolean) as IcdCode[]
      const newRanked = order.map((code, idx) => ({
        ...code,
        rank: idx + 1,
      }))
      setRankedCodes(newRanked)

      const score: AdjRwResult = {
        estimatedAdjRw: res.estimatedAdjRw || 0,
        confidenceLevel: parseFloat(res.confidenceLevel || "0") / 100,
        primaryWeight: res.primaryWeight || 0,
        secondaryWeight: res.secondaryWeight || 0,
        complexityFactor: res.complexityFactor || 0,
        recommendations: res.recommendations || [],
      }

      setAdjRwScore(score)
      toast({
        title: "AdjRw Calculated",
        description: `Ranking efficiency score: ${(score.confidenceLevel * 100).toFixed(0)}%`,
      })
    } catch (err) {
      toast({
        title: "API Error",
        description: "Failed to contact optimization service.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-100"
    if (score >= 0.6) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellent"
    if (score >= 0.6) return "Good"
    if (score >= 0.4) return "Fair"
    return "Needs Review"
  }

  // Show Calculate AdjRw button when:
  // 1. We have ranked codes AND no AdjRw score calculated yet
  // 2. Either in ranking mode or ranking is complete
  const shouldShowCalculateButton = rankedCodes.length > 0 && !adjRwScore

  if (isCalculating) {
    const count = Math.min(selectedCodes.length || rankedCodes.length || 3, 12)
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!isRankingMode && rankedCodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Rank your selected diagnoses by priority (Primary diagnosis first)</p>
        <Button
          onClick={handleCalculateAdjRw}
          className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>Start Ranking</>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Diagnosis Priority Ranking</h3>
          <p className="text-sm text-gray-600">Drag and drop to reorder. First position = Primary diagnosis</p>
        </div>
        <div className="flex space-x-2">
          {shouldShowCalculateButton && (
            <Button
              onClick={handleCalculateAdjRw}
              className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate AdjRw
                </>
              )}
            </Button>
          )}
          {/* {isRankingMode && (
            <Button onClick={handleSaveRanking} variant="outline">
              Save Ranking
            </Button>
          )}
          {!isRankingMode && rankedCodes.length > 0 && (
            <Button onClick={() => setIsRankingMode(true)} variant="outline">
              Re-rank Diagnoses
            </Button>
          )} */}
        </div>
      </div>

      {/* AdjRw Score Section - Only show when calculated */}
      {adjRwScore && (
        <Card className="bg-gradient-to-r from-primary-from/10 to-primary-to/10 border-[#115ad4]/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-[#115ad4]">
              <TrendingUp className="w-5 h-5 mr-2" />
              AdjRw Score - Ranking Efficiency
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 ml-2 text-[#115ad4] cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      Adjusted Relative Weight (AdjRw) measures the clinical appropriateness and resource efficiency of
                      your diagnosis ranking. Higher scores indicate better alignment with clinical best practices.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-[#115ad4]">{adjRwScore.estimatedAdjRw.toFixed(2)}</div>
                <div>
                  <Badge className={`${getScoreColor(adjRwScore.confidenceLevel)} border-0`}>
                    {getScoreLabel(adjRwScore.confidenceLevel)}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Efficiency: {(adjRwScore.confidenceLevel * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Clinical Alignment</p>
                <Progress value={adjRwScore.confidenceLevel * 100} className="w-32 mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#115ad4]/20">
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#115ad4]">{adjRwScore.primaryWeight.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Primary Diagnosis Weight</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#115ad4]">{adjRwScore.secondaryWeight.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Secondary Diagnoses Weight</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#115ad4]">{adjRwScore.complexityFactor.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Complexity Factor</p>
              </div>
            </div>

            {adjRwScore.recommendations.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-[#115ad4]/20">
                <h4 className="font-medium text-gray-900 mb-2">Optimization Recommendations:</h4>
                <ul className="space-y-1">
                  {adjRwScore.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-[#115ad4] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleCalculateAdjRw}
                variant="outline"
                size="sm"
                className="border-[#115ad4] text-[#115ad4] hover:bg-primary-from/10"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Recalculate AdjRw
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for AdjRw calculation when not yet calculated */}
      {shouldShowCalculateButton && !adjRwScore && (
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <Calculator className="w-12 h-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">AdjRw Score Available</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click "Calculate AdjRw" to analyze your diagnosis ranking efficiency
                </p>
              </div>
              <Button
                onClick={handleCalculateAdjRw}
                className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90 mt-4"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate AdjRw Score
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rankedCodes.map((code) => code.code)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {rankedCodes.map((code, index) => (
              <SortableItem key={code.code} id={code.code}>
                <Card
                  className={`transition-all ${index === 0 ? "ring-2 ring-emerald-400 bg-emerald-50" : "hover:shadow-md"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <Badge variant="outline" className="font-mono">
                            {code.code}
                          </Badge>
                          {index === 0 && <Badge className="bg-emerald-500 text-white">Primary Diagnosis</Badge>}
                          {adjRwScore && (
                            <Badge variant="secondary" className="text-xs">
                              Weight:{" "}
                              {index === 0
                                ? adjRwScore.primaryWeight.toFixed(1)
                                : (adjRwScore.secondaryWeight / (rankedCodes.length - 1)).toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium">{code.description}</p>
                        {code.category && <p className="text-sm text-gray-600">Category: {code.category}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty slots for visual reference */}
      {rankedCodes.length < 12 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">Available slots: {12 - rankedCodes.length}</p>
          <div className="grid gap-2">
            {Array.from({ length: Math.min(3, 12 - rankedCodes.length) }).map((_, index) => (
              <Card key={index} className="border-dashed border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                      {rankedCodes.length + index + 1}
                    </div>
                    <p className="text-sm">Empty slot</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
