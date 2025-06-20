export interface Patient {
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  mrn: string
  phone: string
  email: string
  lastVisit?: string
  address?: string
  emergencyContact?: string
}

const mockPatients: Patient[] = [
  {
    patientId: "P001234",
    firstName: "John",
    lastName: "Smith",
    dateOfBirth: "1985-03-15",
    gender: "male",
    mrn: "MRN001234",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    lastVisit: "2024-01-15",
    address: "123 Main St, Anytown, ST 12345",
    emergencyContact: "Jane Smith - (555) 123-4568",
  },
  {
    patientId: "P001235",
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: "1992-07-22",
    gender: "female",
    mrn: "MRN001235",
    phone: "(555) 234-5678",
    email: "sarah.johnson@email.com",
    lastVisit: "2024-02-10",
    address: "456 Oak Ave, Somewhere, ST 12346",
    emergencyContact: "Mike Johnson - (555) 234-5679",
  },
  {
    patientId: "P001236",
    firstName: "Michael",
    lastName: "Brown",
    dateOfBirth: "1978-11-08",
    gender: "male",
    mrn: "MRN001236",
    phone: "(555) 345-6789",
    email: "michael.brown@email.com",
    lastVisit: "2024-01-28",
    address: "789 Pine St, Elsewhere, ST 12347",
    emergencyContact: "Lisa Brown - (555) 345-6790",
  },
  {
    patientId: "P001237",
    firstName: "Emily",
    lastName: "Davis",
    dateOfBirth: "1990-05-12",
    gender: "female",
    mrn: "MRN001237",
    phone: "(555) 456-7890",
    email: "emily.davis@email.com",
    lastVisit: "2024-02-05",
    address: "321 Elm Dr, Nowhere, ST 12348",
    emergencyContact: "Robert Davis - (555) 456-7891",
  },
  {
    patientId: "P001238",
    firstName: "David",
    lastName: "Wilson",
    dateOfBirth: "1965-09-30",
    gender: "male",
    mrn: "MRN001238",
    phone: "(555) 567-8901",
    email: "david.wilson@email.com",
    lastVisit: "2024-01-20",
    address: "654 Maple Ln, Anywhere, ST 12349",
    emergencyContact: "Mary Wilson - (555) 567-8902",
  },
  {
    patientId: "P001239",
    firstName: "Jennifer",
    lastName: "Martinez",
    dateOfBirth: "1988-12-03",
    gender: "female",
    mrn: "MRN001239",
    phone: "(555) 678-9012",
    email: "jennifer.martinez@email.com",
    lastVisit: "2024-02-12",
    address: "987 Cedar St, Someplace, ST 12350",
    emergencyContact: "Carlos Martinez - (555) 678-9013",
  },
  {
    patientId: "P001240",
    firstName: "Robert",
    lastName: "Anderson",
    dateOfBirth: "1972-04-18",
    gender: "male",
    mrn: "MRN001240",
    phone: "(555) 789-0123",
    email: "robert.anderson@email.com",
    lastVisit: "2024-01-25",
    address: "147 Birch Ave, Everytown, ST 12351",
    emergencyContact: "Susan Anderson - (555) 789-0124",
  },
  {
    patientId: "P001241",
    firstName: "Lisa",
    lastName: "Taylor",
    dateOfBirth: "1995-08-07",
    gender: "female",
    mrn: "MRN001241",
    phone: "(555) 890-1234",
    email: "lisa.taylor@email.com",
    lastVisit: "2024-02-08",
    address: "258 Spruce Rd, Hometown, ST 12352",
    emergencyContact: "Mark Taylor - (555) 890-1235",
  },
]

export function searchPatients(query: string): Patient[] {
  const searchTerm = query.toLowerCase().trim()

  if (!searchTerm) return []

  return mockPatients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    const patientId = patient.patientId.toLowerCase()
    const mrn = patient.mrn.toLowerCase()
    const phone = patient.phone.replace(/\D/g, "") // Remove non-digits for phone search

    return (
      fullName.includes(searchTerm) ||
      patient.firstName.toLowerCase().includes(searchTerm) ||
      patient.lastName.toLowerCase().includes(searchTerm) ||
      patientId.includes(searchTerm) ||
      mrn.includes(searchTerm) ||
      phone.includes(searchTerm.replace(/\D/g, ""))
    )
  })
}

export function getPatientById(patientId: string): Patient | undefined {
  return mockPatients.find((patient) => patient.patientId === patientId)
}

export function getPatientByMRN(mrn: string): Patient | undefined {
  return mockPatients.find((patient) => patient.mrn === mrn)
}
