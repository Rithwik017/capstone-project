import { Appointment, AppointmentStatus } from '@/models/Appointment'
import { Patient } from '@/models/Patient'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Clock, User, Stethoscope } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AppointmentTableProps {
  appointments: Appointment[]
  patients: Patient[]
  doctors: { id: number; fullName: string; departmentId: number; department: string }[]
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => Promise<void>
}

const statusStyles: Record<AppointmentStatus, string> = {
  [AppointmentStatus.New]: 'bg-amber-100 text-amber-800 border-amber-200',
  [AppointmentStatus.Confirmed]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [AppointmentStatus.Completed]: 'bg-sky-100 text-sky-800 border-sky-200',
  [AppointmentStatus.Cancelled]: 'bg-rose-100 text-rose-800 border-rose-200',
}

function departmentBadgeStyle(department: string) {
  const key = department.toLowerCase()

  if (key.includes('card')) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (key.includes('neuro')) {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }
  if (key.includes('pedia') || key.includes('child')) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (key.includes('derma') || key.includes('skin')) {
    return 'border-orange-200 bg-orange-50 text-orange-700'
  }
  if (key.includes('ortho') || key.includes('bone')) {
    return 'border-cyan-200 bg-cyan-50 text-cyan-700'
  }
  if (key.includes('general')) {
    return 'border-slate-300 bg-slate-100 text-slate-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function formatScheduled(dateValue: string) {
  const date = new Date(dateValue)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppointmentTable({ appointments, patients, doctors, onStatusChange }: AppointmentTableProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Scheduled Date/Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => {
              const patient = patients.find((p) => p.id === appointment.patientId)
              const doctor = doctors.find((d) => d.fullName === appointment.doctorName)
              const departmentName = doctor?.department ?? 'General'
              const patientName = patient?.getFullName() ?? 'Unknown Patient'
              const canChangeStatus =
                appointment.status !== AppointmentStatus.Completed &&
                appointment.status !== AppointmentStatus.Cancelled

              return (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs font-semibold bg-slate-200 text-slate-700">
                          {initials(patientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-500" />
                        <span className="font-medium text-slate-800">{patientName}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Stethoscope size={14} className="text-slate-500" />
                      <span>{appointment.doctorName}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('font-medium', departmentBadgeStyle(departmentName))}
                    >
                      {departmentName}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock size={14} className="text-slate-500" />
                      <span>{formatScheduled(appointment.appointmentDateTime)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('rounded-full px-3 py-1 font-medium', statusStyles[appointment.status] ?? statusStyles[AppointmentStatus.New])}
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {canChangeStatus ? (
                      <div className="inline-block min-w-[150px]">
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => onStatusChange(appointment.id, value as AppointmentStatus)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(AppointmentStatus).map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                disabled={!appointment.canTransitionTo(status) && status !== appointment.status}
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Locked</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

