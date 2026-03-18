import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Patient } from '@/models/Patient'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CalendarBlank, WarningCircle } from '@phosphor-icons/react'
import { PatientFormDialog } from '@/components/clinic/PatientFormDialog'
import { doctorLeaves, formatLeaveDate, isDoctorOnLeave } from '@/lib/doctorLeaves'

interface AppointmentFormDialogProps {
  patients: Patient[]
  doctors: { id: number; fullName: string; departmentId: number; department: string }[]
  departments: { id: number; name: string }[]
  onSubmit: (appointmentData: {
    patientId: string
    doctorName: string
    appointmentDateTime: string
    notes?: string
  }) => Promise<void>
  onRegisterPatient: (patientData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    dateOfBirth: string
  }) => Promise<Patient>
}

interface CompletedCheckupHistoryItem {
  checkupId: number
  doctorName: string
  visitReason: string
  completedDate?: string
}

export function AppointmentFormDialog({
  patients,
  doctors,
  departments,
  onSubmit,
  onRegisterPatient,
}: AppointmentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    departmentId: '',
    doctorName: '',
    date: '',
    time: '',
    notes: '',
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [patientHistory, setPatientHistory] = useState<CompletedCheckupHistoryItem[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [registeringPhone, setRegisteringPhone] = useState('')
  const [verifying, setVerifying] = useState(false)

  const filteredDoctors = useMemo(() => {
    if (!formData.departmentId) {
      return []
    }

    const departmentId = Number(formData.departmentId)
    return doctors.filter((doctor) => doctor.departmentId === departmentId)
  }, [doctors, formData.departmentId])

  const getLeaveNotice = (doctorName: string): string | null => {
    const leave = isDoctorOnLeave(doctorName)
    return leave ? `Doctor is on leave until ${formatLeaveDate(leave.until)}.` : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.patientId || !formData.departmentId || !formData.doctorName || !formData.date || !formData.time) {
      setErrorMsg('Please fill all required fields.')
      return
    }

    const leaveNotice = getLeaveNotice(formData.doctorName)
    if (leaveNotice) {
      setErrorMsg(leaveNotice)
      return
    }

    const appointmentDateTime = `${formData.date}T${formData.time}:00`
    setLoading(true)
    try {
      await onSubmit({
        patientId: formData.patientId,
        doctorName: formData.doctorName,
        appointmentDateTime,
        notes: formData.notes || undefined,
      })

      setFormData({
        patientId: '',
        departmentId: '',
        doctorName: '',
        date: '',
        time: '',
        notes: '',
      })
      setPhoneNumber('')
      setPatientName('')
      setPatientId('')
      setPatientHistory([])
      setOpen(false)
      setErrorMsg(null)
    } catch (error) {
      if (error instanceof Error && (error.message.toLowerCase().includes('booked') || error.message.includes('400'))) {
        setErrorMsg('Doctor is already booked for this time slot.')
      } else {
        setErrorMsg('An error occurred while booking the appointment. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setShowRegister(false)
    setErrorMsg(null)
    const normalizedPhone = phoneNumber.trim()

    if (!normalizedPhone) {
      setErrorMsg('Enter a phone number to search.')
      return
    }

    setVerifying(true)
    try {
      const response = await fetch(`http://localhost:5000/patients/search?phone=${normalizedPhone}`);
      if (response.ok) {
        const patient = await response.json()
        const normalizedPatientId = String(patient.id)
        setPatientName(patient.name || `${patient.firstName} ${patient.lastName}`)
        setPatientId(normalizedPatientId)
        setFormData((prev) => ({ ...prev, patientId: normalizedPatientId }))

        const completedResponse = await fetch(
          `http://localhost:5000/checkups/completed?patientId=${normalizedPatientId}`
        );
        if (completedResponse.ok) {
          const completedRaw = await completedResponse.json()
          const history = Array.isArray(completedRaw)
            ? completedRaw.slice(0, 5).map((item) => ({
              checkupId: Number(item.checkupId),
              doctorName: item.doctorName ?? 'Unknown Doctor',
              visitReason: item.visitReason ?? 'N/A',
              completedDate: item.completedDate,
            }))
            : []
          setPatientHistory(history)
        } else {
          setPatientHistory([])
        }
      } else {
        setPatientName('')
        setPatientId('')
        setPatientHistory([])
        setShowRegister(true)
        setRegisteringPhone(normalizedPhone)
      }
    } catch {
      setErrorMsg('An error occurred while searching for the patient.')
      setPatientHistory([])
    } finally {
      setVerifying(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <CalendarBlank size={20} />
        Book Appointment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>Schedule an appointment for a patient</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} id="appointment-form">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="department">Visit Reason / Department *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      departmentId: value,
                      doctorName: '',
                    }))
                  }
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button type="button" onClick={handleVerify} disabled={verifying}>
                    {verifying ? 'Searching...' : 'Verify Existing Patient'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRegisteringPhone(phoneNumber.trim())
                      setShowPatientDialog(true)
                    }}
                  >
                    Register New Patient & Continue
                  </Button>
                </div>
              </div>

              {patientName && <p className="text-sm text-slate-700">Patient Name: {patientName}</p>}

              {patientId && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">Patient History</p>
                  {patientHistory.length > 0 ? (
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      {patientHistory.map((entry) => (
                        <li key={entry.checkupId}>
                          <span className="font-medium">{entry.visitReason}</span>
                          <span className="mx-1">with</span>
                          <span className="font-medium">{entry.doctorName}</span>
                          <span className="text-slate-500">
                            {entry.completedDate ? ` (${new Date(entry.completedDate).toLocaleDateString()})` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1">No prior completed checkups found.</p>
                  )}
                </div>
              )}

              {showRegister && (
                <div className="flex flex-col gap-2">
                  <span className="text-red-600">Patient not found.</span>
                  <Button type="button" onClick={() => setShowPatientDialog(true)}>
                    Register New Patient
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <Select
                  value={formData.doctorName}
                  onValueChange={(value) => setFormData({ ...formData, doctorName: value })}
                  disabled={!formData.departmentId}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder={formData.departmentId ? 'Select a doctor' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => {
                      const leave = isDoctorOnLeave(doctor.fullName)
                      return (
                        <SelectItem key={doctor.id} value={doctor.fullName} disabled={Boolean(leave)}>
                          <div className="flex w-full items-center justify-between gap-3">
                            <span>{doctor.fullName}</span>
                            {leave && (
                              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {formData.departmentId && filteredDoctors.length === 0 && (
                  <p className="text-xs text-slate-500">No doctors found in this department.</p>
                )}
                {doctorLeaves.length > 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-800">
                    <p className="mb-1 font-medium">Unavailable now</p>
                    {doctorLeaves.map((leave) => (
                      <p key={`${leave.doctorName}-${leave.until}`} className="leading-5">
                        {leave.doctorName} • until {formatLeaveDate(leave.until)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={minDate}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {errorMsg && (
                <Alert variant="destructive" className="mt-2 border-red-300 bg-red-50">
                  <WarningCircle size={16} />
                  <AlertTitle>Booking Error</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="appointment-form" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPatientDialog && (
        <PatientFormDialog
          open={showPatientDialog}
          onOpenChange={setShowPatientDialog}
          initialPhoneNumber={registeringPhone}
          onSubmit={async (patientData) => {
            try {
              const newPatient = await onRegisterPatient(patientData)
              setPatientName(newPatient.getFullName())
              setPatientId(newPatient.id)
              setPhoneNumber(newPatient.phoneNumber)
              setFormData((prev) => ({ ...prev, patientId: newPatient.id }))
              setShowPatientDialog(false)
              setShowRegister(false)
              setPatientHistory([])
              setErrorMsg(null)
            } catch {
              setErrorMsg('Failed to register patient. Please try again.')
            }
          }}
        />
      )}
    </>
  )
}
