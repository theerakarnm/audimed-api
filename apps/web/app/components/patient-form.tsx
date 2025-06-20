"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDiagnosisStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"

interface PatientFormProps {
  onPatientSaved: () => void
}

export function PatientForm({ onPatientSaved }: PatientFormProps) {
  const { patientInfo, setPatientInfo } = useDiagnosisStore()

  const handleSave = () => {
    if (!patientInfo.firstName || !patientInfo.lastName || !patientInfo.dateOfBirth || !patientInfo.patientId) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required patient information fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Patient Information Saved",
      description: "You can now proceed with diagnosis entry.",
    })

    onPatientSaved()
  }

  const updatePatientInfo = (field: string, value: string | Date) => {
    setPatientInfo({
      ...patientInfo,
      [field]: value,
    })
  }

  const generatePatientId = () => {
    const id = `P${Date.now().toString().slice(-6)}`
    updatePatientInfo("patientId", id)
    toast({
      title: "Patient ID Generated",
      description: `Generated ID: ${id}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID *</Label>
          <div className="flex space-x-2">
            <Input
              id="patientId"
              placeholder="Enter patient ID"
              value={patientInfo.patientId}
              onChange={(e) => updatePatientInfo("patientId", e.target.value)}
            />
            <Button type="button" variant="outline" onClick={generatePatientId}>
              Generate
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={patientInfo.firstName}
            onChange={(e) => updatePatientInfo("firstName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={patientInfo.lastName}
            onChange={(e) => updatePatientInfo("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !patientInfo.dateOfBirth && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {patientInfo.dateOfBirth ? format(patientInfo.dateOfBirth, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={patientInfo.dateOfBirth}
                onSelect={(date) => date && updatePatientInfo("dateOfBirth", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={patientInfo.gender} onValueChange={(value) => updatePatientInfo("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mrn">Medical Record Number</Label>
          <Input
            id="mrn"
            placeholder="Enter MRN"
            value={patientInfo.mrn}
            onChange={(e) => updatePatientInfo("mrn", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            value={patientInfo.phone || ""}
            onChange={(e) => updatePatientInfo("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={patientInfo.email || ""}
            onChange={(e) => updatePatientInfo("email", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Patient Information
        </Button>
      </div>
    </div>
  )
}
