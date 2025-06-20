"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, RefreshCw } from "lucide-react"
import { useDiagnosisStore } from "@/lib/store"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export function SelectedCodes() {
  const { selectedCodes, removeSelectedCode, addSelectedCode, recalculateRanking, rankedCodes } = useDiagnosisStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customCode, setCustomCode] = useState("")
  const [customDescription, setCustomDescription] = useState("")

  const handleRemoveCode = (code: string) => {
    removeSelectedCode(code)
    toast({
      title: "Code Removed",
      description: `ICD-10 code ${code} has been removed.`,
    })
  }

  const handleAddCustomCode = () => {
    if (!customCode.trim() || !customDescription.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter both code and description.",
        variant: "destructive",
      })
      return
    }

    const newCode = {
      code: customCode.trim().toUpperCase(),
      description: customDescription.trim(),
      confidence: 1.0,
      category: "Custom",
    }

    addSelectedCode(newCode)
    setCustomCode("")
    setCustomDescription("")
    setIsDialogOpen(false)

    toast({
      title: "Custom Code Added",
      description: `ICD-10 code ${newCode.code} has been added.`,
    })
  }

  const handleRecalculateRanking = () => {
    recalculateRanking()
    toast({
      title: "Ranking Recalculated",
      description: "Diagnoses have been automatically ranked by clinical priority and confidence.",
    })
  }

  // Check if ranking needs recalculation (selected codes changed but ranking exists)
  const needsRecalculation =
    rankedCodes.length > 0 &&
    (selectedCodes.length !== rankedCodes.length ||
      !selectedCodes.every((selected) => rankedCodes.some((ranked) => ranked.code === selected.code)))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {selectedCodes.map((code) => (
          <Badge
            key={code.code}
            variant="secondary"
            className="px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <span className="font-mono mr-2">{code.code}</span>
            <span className="mr-2">{code.description}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-red-100"
              onClick={() => handleRemoveCode(code.code)}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom ICD-10 Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom ICD-10 Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">ICD-10 Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., Z51.11"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter the diagnosis description..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomCode}>Add Code</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {selectedCodes.length > 1 && (
          <Button
            onClick={handleRecalculateRanking}
            className="bg-green-600 hover:bg-green-700"
            variant={needsRecalculation ? "default" : "outline"}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {needsRecalculation ? "Recalculate Diagnosis Ranking" : "Auto-Rank Diagnoses"}
          </Button>
        )}
      </div>

      {selectedCodes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedCodes.length} code{selectedCodes.length !== 1 ? "s" : ""} selected
          </p>
          {needsRecalculation && (
            <p className="text-sm text-amber-600 font-medium">
              ⚠️ Selected codes have changed - recalculation recommended
            </p>
          )}
        </div>
      )}
    </div>
  )
}
