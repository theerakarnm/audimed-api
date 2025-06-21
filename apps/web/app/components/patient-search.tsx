"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Search, Loader2, User, Calendar, Phone, FileText } from "lucide-react"
import { useDiagnosisStore } from "~/libs/store"
import { searchPatients, type Patient } from "~/libs/mock-patients"
import { toast } from "~/hooks/use-toast"

interface PatientSearchProps {
  onPatientSelected: () => void
}

export function PatientSearch({ onPatientSelected }: PatientSearchProps) {
  const { setPatientInfo } = useDiagnosisStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a patient name, ID, or MRN to search.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      const results = searchPatients(searchQuery)
      setSearchResults(results)

      if (results.length === 0) {
        toast({
          title: "No Patients Found",
          description: "No patients match your search criteria. Try a different search term.",
        })
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setPatientInfo({
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: new Date(patient.dateOfBirth),
      gender: patient.gender,
      mrn: patient.mrn,
      phone: patient.phone,
      email: patient.email,
    })

    toast({
      title: "Patient Selected",
      description: `${patient.firstName} ${patient.lastName} has been selected.`,
    })

    onPatientSelected()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Search by name, Patient ID, or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-base"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                <Badge variant="secondary">{searchResults.length} patient(s) found</Badge>
              </div>

              <div className="grid gap-4">
                {searchResults.map((patient) => (
                  <Card
                    key={patient.patientId}
                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[#115ad4]"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-from/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-[#115ad4]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary-from to-primary-to hover:from-primary-from/90 hover:to-primary-to/90"
                        >
                          Select Patient
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          MRN: {patient.mrn}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {patient.phone}
                        </div>
                      </div>

                      {patient.lastVisit && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            !isSearching && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No patients found</p>
                <p className="text-sm">Try searching with a different name, ID, or MRN</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
