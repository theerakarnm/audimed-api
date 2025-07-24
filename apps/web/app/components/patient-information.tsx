"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { User, Search, Plus, UserCheck } from "lucide-react"
import { PatientSearch } from "~/components/patient-search"
import { PatientForm } from "~/components/patient-form"
import { useDiagnosisStore } from "~/hooks/store/useDiagnosisStore"

export function PatientInformation() {
  const { patientInfo, isPatientInfoComplete } = useDiagnosisStore()
  const [activeTab, setActiveTab] = useState("search")
  const [isEditing, setIsEditing] = useState(!isPatientInfoComplete())

  const handleEdit = () => {
    setIsEditing(true)
    setActiveTab("manual")
  }

  const handlePatientSelected = () => {
    setIsEditing(false)
  }

  return (
    <Card className="bg-primary-from/10 border-[#115ad4]/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl text-[#115ad4]">
            <User className="w-6 h-6 mr-2" />
            Patient Information
          </CardTitle>
          {!isEditing && isPatientInfoComplete() && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                <UserCheck className="w-4 h-4 mr-1" />
                Patient Selected
              </div>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="search" className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search Patient
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <PatientSearch onPatientSelected={handlePatientSelected} />
            </TabsContent>

            <TabsContent value="manual">
              <PatientForm onPatientSaved={handlePatientSelected} />
            </TabsContent>
          </Tabs>
        ) : (
          <PatientSummary />
        )}

        {!isPatientInfoComplete() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <strong>Required:</strong> Please select or create patient information before proceeding with diagnosis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PatientSummary() {
  const { patientInfo } = useDiagnosisStore()

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Patient ID</label>
          <p className="text-gray-900 font-mono">{patientInfo.patientId}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Full Name</label>
          <p className="text-gray-900">{`${patientInfo.firstName} ${patientInfo.lastName}`}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
          <p className="text-gray-900">
            {patientInfo.dateOfBirth ? patientInfo.dateOfBirth.toLocaleDateString() : "Not specified"}
          </p>
        </div>
        {patientInfo.gender && (
          <div>
            <label className="text-sm font-medium text-gray-500">Gender</label>
            <p className="text-gray-900 capitalize">{patientInfo.gender.replace("-", " ")}</p>
          </div>
        )}
        {patientInfo.mrn && (
          <div>
            <label className="text-sm font-medium text-gray-500">MRN</label>
            <p className="text-gray-900 font-mono">{patientInfo.mrn}</p>
          </div>
        )}
        {patientInfo.phone && (
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{patientInfo.phone}</p>
          </div>
        )}
      </div>
    </div>
  )
}
