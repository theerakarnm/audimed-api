"use client"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { FileText, Download, Printer } from "lucide-react"
import { useDiagnosisStore } from "~/hooks/store/useDiagnosisStore"
import { toast } from "~/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function ExportOptions() {
  const { rankedCodes, diagnosisText, patientInfo } = useDiagnosisStore()

  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Diagnosis Report", 10, 10)

    doc.setFontSize(12)
    const name = `${patientInfo.firstName} ${patientInfo.lastName}`.trim()
    if (name) {
      doc.text(`Patient: ${name}`, 10, 20)
    }
    if (patientInfo.patientId) {
      doc.text(`ID: ${patientInfo.patientId}`, 10, 27)
    }

    if (diagnosisText) {
      doc.text("Diagnosis:", 10, 37)
      doc.text(doc.splitTextToSize(diagnosisText, 180), 10, 44)
    }

    const startY = diagnosisText ? 60 : 30

    autoTable(doc, {
      startY,
      head: [["Rank", "Code", "Description", "Category", "Primary"]],
      body: rankedCodes.map((code) => [
        code.rank,
        code.code,
        code.description,
        code.category || "",
        code.rank === 1 ? "Yes" : "No",
      ]),
    })

    doc.save(`diagnosis-${new Date().toISOString().split("T")[0]}.pdf`)

    toast({
      title: "PDF Export",
      description: "Diagnosis report has been exported as PDF.",
    })
  }

  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      diagnosisText,
      patientInfo,
      rankedCodes: rankedCodes.map((code) => ({
        rank: code.rank,
        code: code.code,
        description: code.description,
        category: code.category,
        isPrimary: code.rank === 1,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagnosis-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "JSON Export",
      description: "Diagnosis data has been exported as JSON.",
    })
  }

  const handleExportCSV = () => {
    const csvHeaders = [
      "Rank",
      "ICD-10 Code",
      "Description",
      "Category",
      "Primary",
    ]
    const csvRows = rankedCodes.map((code) => [
      code.rank,
      code.code,
      `"${code.description}"`,
      code.category || "",
      code.rank === 1 ? "Yes" : "No",
    ])

    const patientInfoRows = [
      [],
      ["Patient ID", patientInfo.patientId],
      ["First Name", patientInfo.firstName],
      ["Last Name", patientInfo.lastName],
      ["Date of Birth", patientInfo.dateOfBirth?.toLocaleDateString() || ""],
      ["Gender", patientInfo.gender],
      ["MRN", patientInfo.mrn],
    ]

    const csvContent = [
      ...patientInfoRows.map((row) => row.join(",")),
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagnosis-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "CSV Export",
      description: "Diagnosis data has been exported as CSV.",
    })
  }

  const handlePrint = () => {
    window.print()
    toast({
      title: "Print",
      description: "Print dialog has been opened.",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleExportPDF}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2 text-red-600" />
            PDF Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">Professional medical report with diagnosis hierarchy</p>
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleExportJSON}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2 text-[#115ad4]" />
            JSON Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">Structured data format for system integration</p>
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleExportCSV}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">Spreadsheet format for data analysis</p>
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handlePrint}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Printer className="w-5 h-5 mr-2 text-gray-600" />
            Print
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">Print-friendly diagnosis summary</p>
          <Button className="w-full" variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
