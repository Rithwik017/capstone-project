import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Patient } from '@/models/Patient'
import { User, Envelope, Phone, Cake } from '@phosphor-icons/react'

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  const rawId = patient?.id as unknown
  const idText = rawId == null ? 'N/A' : String(rawId)
  const idSuffix = idText.includes('-') ? idText.split('-')[1] : idText

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User size={20} className="text-primary" />
            {patient.getFullName()}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            ID: {idSuffix}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Envelope size={16} />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={16} />
            <span>{patient.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cake size={16} />
            <span>{patient.getAge()} years old</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Registered: {new Date(patient.registrationDate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
