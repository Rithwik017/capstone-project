import { useEffect, useMemo, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Patient } from '@/models/Patient'
import { Appointment, AppointmentStatus } from '@/models/Appointment'
import { PatientFormDialog } from '@/components/clinic/PatientFormDialog'
import { AppointmentFormDialog } from '@/components/clinic/AppointmentFormDialog'
import { AppointmentTable } from './components/clinic/AppointmentCard'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Heartbeat,
  UsersThree,
  CalendarX,
  House,
  CalendarBlank,
  UserList,
  Stethoscope,
  Gear,
  List,
  X,
  ClockCounterClockwise,
  MagnifyingGlass,
  CheckCircle,
} from '@phosphor-icons/react'
import { doctorLeaves, formatLeaveDate, isDoctorOnLeave } from '@/lib/doctorLeaves'

type Section = 'Dashboard' | 'Appointments' | 'Patients' | 'Doctors' | 'History'

interface DoctorApiModel {
  id: number
  departmentId: number
  fullName: string
  department: string
}

interface DepartmentApiModel {
  id: number
  name: string
}

interface CompletedCheckupApiModel {
  checkupId: number
  patientId: number
  doctorName: string
  visitReason: string
  completedDate?: string
}

function App() {
  const API_BASE = 'http://localhost:5000/api';

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<DoctorApiModel[]>([])
  const [departments, setDepartments] = useState<DepartmentApiModel[]>([])
  const [completedCheckups, setCompletedCheckups] = useState<CompletedCheckupApiModel[]>([])
  const [completedCount, setCompletedCount] = useState<number | null>(null)
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('Dashboard')
  const [patientSearch, setPatientSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')

  useEffect(() => {
    loadData()
    fetchTotalAppointments()
    fetchCompletedCheckupCount()
  }, [])

  const toPatientModel = (raw: any) =>
    new Patient(
      raw.firstName,
      raw.lastName,
      raw.email,
      raw.phoneNumber,
      raw.dateOfBirth,
      String(raw.id),
      raw.registrationDate
    )

  const toAppointmentStatus = (status: string): AppointmentStatus => {
    switch (status) {
      case 'New':
        return AppointmentStatus.New
      case 'Confirmed':
        return AppointmentStatus.Confirmed
      case 'Completed':
        return AppointmentStatus.Completed
      case 'Cancelled':
        return AppointmentStatus.Cancelled
      default:
        return AppointmentStatus.New
    }
  }

  const toAppointmentModel = (raw: any) =>
    new Appointment(
      String(raw.patientId),
      raw.doctorName,
      raw.appointmentDateTime,
      raw.notes,
      toAppointmentStatus(raw.status),
      String(raw.id),
      raw.createdAt,
      raw.updatedAt
    )

  const loadData = async () => {
    try {
      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/appointments`),
        fetch(`${API_BASE}/doctors`),
      ])

      if (!patientsRes.ok || !appointmentsRes.ok || !doctorsRes.ok) {
        throw new Error('Failed to fetch patients, appointments, or doctors')
      }

      const [patientsRaw, appointmentsRaw, doctorsRaw] = await Promise.all([
        patientsRes.json(),
        appointmentsRes.json(),
        doctorsRes.json(),
      ])

      setPatients(Array.isArray(patientsRaw) ? patientsRaw.map(toPatientModel) : [])
      setAppointments(Array.isArray(appointmentsRaw) ? appointmentsRaw.map(toAppointmentModel) : [])
      setDoctors(Array.isArray(doctorsRaw) ? doctorsRaw : [])

      try {
        const departmentsRes = await fetch(`${API_BASE}/departments`)
        if (departmentsRes.ok) {
          const departmentsRaw = await departmentsRes.json()
          setDepartments(Array.isArray(departmentsRaw) ? departmentsRaw : [])
        } else {
          setDepartments([])
        }
      } catch {
        setDepartments([])
      }

      try {
        const completedRes = await fetch(`${API_BASE}/appointments/completed`)
        if (completedRes.ok) {
          const completedRaw = await completedRes.json()
          setCompletedCheckups(Array.isArray(completedRaw) ? completedRaw : [])
        } else {
          setCompletedCheckups([])
        }
      } catch {
        setCompletedCheckups([])
      }
    } catch (error) {
      toast.error('Failed to load data', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/count`)
      if (response.ok) {
        const count = await response.json()
        setTotalAppointments(Number(count))
      } else {
        setTotalAppointments(null)
      }
    } catch {
      setTotalAppointments(null)
    }
  }

  const fetchCompletedCheckupCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/completed/count`)
      if (response.ok) {
        const count = await response.json()
        setCompletedCount(Number(count))
      } else {
        setCompletedCount(null)
      }
    } catch {
      setCompletedCount(null)
    }
  }

  const handlePatientSubmit = async (patientData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    dateOfBirth: string
  }): Promise<Patient> => {
    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `HTTP ${response.status}`)
      }

      const raw = await response.json()
      const newPatient = toPatientModel(raw)

      setPatients((prev) => [...prev, newPatient])
      toast.success('Patient registered successfully', {
        description: `${newPatient.getFullName()} has been added to the system`,
      })
      return newPatient
    } catch (error) {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
      throw error
    }
  }

  const handleAppointmentSubmit = async (appointmentData: {
    patientId: string
    doctorName: string
    appointmentDateTime: string
    notes?: string
  }) => {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: Number(appointmentData.patientId),
          doctorName: appointmentData.doctorName,
          appointmentDateTime: appointmentData.appointmentDateTime,
          notes: appointmentData.notes,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `HTTP ${response.status}`)
      }

      const raw = await response.json()
      const newAppointment = toAppointmentModel(raw)

      setAppointments((prev) => [...prev, newAppointment])
      setTotalAppointments((prev) => (prev === null ? 1 : prev + 1))
      toast.success('Appointment booked successfully', {
        description: `Scheduled for ${new Date(newAppointment.appointmentDateTime).toLocaleString()}`,
      })
    } catch (error) {
      toast.error('Booking failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
      throw error
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${Number(appointmentId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `HTTP ${response.status}`)
      }

      const raw = await response.json()
      const updatedAppointment = toAppointmentModel(raw)

      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? updatedAppointment : apt))
      )
      toast.success('Status updated', {
        description: `Appointment status changed to ${newStatus}`,
      })
    } catch (error) {
      toast.error('Status update failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
      throw error
    }
  }

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime()
  )

  const todaysAppointments = useMemo(() => {
    const today = new Date()
    return sortedAppointments.filter((apt) => {
      const date = new Date(apt.appointmentDateTime)
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      )
    })
  }, [sortedAppointments])

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase()
    if (!query) {
      return patients
    }

    return patients.filter((patient) => {
      return (
        patient.getFullName().toLowerCase().includes(query) ||
        patient.phoneNumber.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query)
      )
    })
  }, [patients, patientSearch])

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase()
    if (!query) {
      return doctors
    }

    return doctors.filter((doctor) => {
      return (
        doctor.fullName.toLowerCase().includes(query) ||
        (doctor.department ?? '').toLowerCase().includes(query)
      )
    })
  }, [doctors, doctorSearch])

  const pendingConfirms = appointments.filter((a) => a.status === AppointmentStatus.New).length
  const availableDoctors = doctors.filter((doctor) => !isDoctorOnLeave(doctor.fullName)).length

  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    setMobileNavOpen(false)
  }

  const navItems = [
    { label: 'Dashboard' as Section, icon: House },
    { label: 'Appointments' as Section, icon: CalendarBlank },
    { label: 'Patients' as Section, icon: UserList },
    { label: 'Doctors' as Section, icon: Stethoscope },
    { label: 'History' as Section, icon: ClockCounterClockwise },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heartbeat size={48} className="mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading clinic data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Inter',_sans-serif]">
      <Toaster position="top-right" richColors closeButton />

      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col px-4 py-6 border-r border-slate-800">
          <div className="flex items-center gap-2 px-2 mb-8">
            <Heartbeat size={24} className="text-cyan-400" weight="fill" />
            <div>
              <h1 className="text-base font-semibold tracking-wide">CareWell Health Services</h1>
              <p className="text-xs text-slate-400">Clinical Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const active = item.label === activeSection
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-slate-800 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/70'}`}
                  type="button"
                  onClick={() => handleSectionChange(item.label)}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <Card className="mt-6 bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-300">Doctor Schedule</p>
              <p className="text-sm">Available today: <span className="font-semibold text-white">{availableDoctors}/{doctors.length || 0}</span></p>
              {doctorLeaves.map((leave) => (
                <p key={`${leave.doctorName}-${leave.until}`} className="text-xs text-amber-300">
                  {leave.doctorName} on leave until {formatLeaveDate(leave.until)}
                </p>
              ))}
            </CardContent>
          </Card>
        </aside>

        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileNavOpen(false)} />
        )}
        <aside className={`md:hidden fixed z-50 top-0 left-0 h-full w-72 bg-slate-900 text-white p-4 transform transition-transform ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heartbeat size={22} className="text-cyan-400" weight="fill" />
              <span className="font-semibold">CareWell</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} className="text-slate-100 hover:bg-slate-800">
              <X size={18} />
            </Button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.label === activeSection
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-slate-800 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/70'}`}
                  type="button"
                  onClick={() => handleSectionChange(item.label)}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 max-h-screen overflow-y-auto">
          <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl m-3 md:m-6">
            <header className="mb-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)}>
                    <List size={18} />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Heartbeat size={30} className="text-cyan-600" weight="fill" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CareWell Health Services</h1>
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-slate-600">{activeSection} Workspace</p>
            </header>

            {activeSection === 'Dashboard' && (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-500">Total Appointments</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{totalAppointments ?? 0}</p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-500">Pending Confirms</p>
                      <div className="mt-2 flex items-center gap-2">
                        <ClockCounterClockwise size={18} className="text-amber-600" />
                        <p className="text-3xl font-bold text-amber-700">{pendingConfirms}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-500">Total Patients</p>
                      <div className="mt-2 flex items-center gap-2">
                        <UsersThree size={18} className="text-sky-600" />
                        <p className="text-3xl font-bold text-sky-700">{patients.length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <p className="text-sm text-slate-500">Completed Checkups</p>
                      <div className="mt-2 flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-600" />
                        <p className="text-3xl font-bold text-emerald-700">{completedCount ?? 0}</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="border-slate-200 lg:col-span-2">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Today's Schedule</h2>
                        <Badge variant="outline">{todaysAppointments.length} appointments</Badge>
                      </div>
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead>Patient</TableHead>
                              <TableHead>Doctor</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {todaysAppointments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                  No appointments for today
                                </TableCell>
                              </TableRow>
                            ) : (
                              todaysAppointments.map((appointment) => {
                                const patient = patients.find((p) => p.id === appointment.patientId)
                                return (
                                  <TableRow key={appointment.id}>
                                    <TableCell>{patient?.getFullName() ?? 'Unknown Patient'}</TableCell>
                                    <TableCell>{appointment.doctorName}</TableCell>
                                    <TableCell>{new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{appointment.status}</Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-5 space-y-3">
                      <h2 className="text-lg font-semibold">Doctor Availability</h2>
                      <p className="text-sm text-slate-600">
                        {availableDoctors} of {doctors.length || 0} doctors available today
                      </p>
                      <Separator />
                      {doctorLeaves.map((leave) => (
                        <div key={`${leave.doctorName}-${leave.until}`} className="rounded-md border border-amber-200 bg-amber-50 p-3">
                          <p className="text-sm font-medium text-amber-900">{leave.doctorName}</p>
                          <p className="text-xs text-amber-700">On leave until {formatLeaveDate(leave.until)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </section>
              </>
            )}

            {activeSection === 'Appointments' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Appointments</h2>
                  <AppointmentFormDialog
                    patients={patients}
                    doctors={doctors}
                    departments={departments}
                    onSubmit={handleAppointmentSubmit}
                    onRegisterPatient={handlePatientSubmit}
                  />
                </div>

                {appointments.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 flex flex-col items-center text-center gap-3">
                      <CalendarX size={36} className="text-muted-foreground" />
                      <p className="text-base font-medium">No records found</p>
                      <p className="text-sm text-muted-foreground">No appointments scheduled. Book an appointment to begin.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <AppointmentTable
                    appointments={sortedAppointments}
                    patients={patients}
                    doctors={doctors}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </section>
            )}

            {activeSection === 'Patients' && (
              <section>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold">Patients</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search name, phone, or email"
                        className="pl-9 w-64"
                      />
                    </div>
                    <PatientFormDialog onSubmit={async (data) => { await handlePatientSubmit(data) }} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date of Birth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">No patients match your search</TableCell>
                        </TableRow>
                      ) : (
                        filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.getFullName()}</TableCell>
                            <TableCell>{patient.phoneNumber}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {activeSection === 'Doctors' && (
              <section>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold">Doctors</h2>
                  <div className="relative">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      placeholder="Search doctor or department"
                      className="pl-9 w-64"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDoctors.map((doctor) => {
                    const leave = isDoctorOnLeave(doctor.fullName)
                    return (
                      <Card key={doctor.id} className="border-slate-200 bg-white">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h3 className="text-base font-semibold text-slate-900">{doctor.fullName}</h3>
                            <Badge variant="outline" className="border-slate-300 text-slate-700">{doctor.department ?? 'General'}</Badge>
                          </div>
                          {leave ? (
                            <p className="text-sm text-amber-700">On leave until {formatLeaveDate(leave.until)}</p>
                          ) : (
                            <p className="text-sm text-emerald-700">Available</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {activeSection === 'History' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Completed Checkup History</h2>
                  <Badge variant="outline">{completedCheckups.length} records</Badge>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Visit Reason</TableHead>
                        <TableHead>Completed Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedCheckups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No completed checkups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedCheckups.map((checkup) => {
                          const patient = patients.find((p) => Number(p.id) === checkup.patientId)
                          return (
                            <TableRow key={checkup.checkupId}>
                              <TableCell>{patient?.getFullName() ?? `Patient #${checkup.patientId}`}</TableCell>
                              <TableCell>{checkup.doctorName}</TableCell>
                              <TableCell>{checkup.visitReason}</TableCell>
                              <TableCell>
                                {checkup.completedDate
                                  ? new Date(checkup.completedDate).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default App

