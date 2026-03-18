export interface DoctorLeave {
  doctorName: string
  until: string
  reason?: string
}

export const doctorLeaves: DoctorLeave[] = [
  {
    doctorName: 'Dr. Sarah Wilson',
    until: '2026-03-22',
    reason: 'Conference',
  },
  {
    doctorName: 'Dr. Michael Brown',
    until: '2026-03-19',
    reason: 'Annual Leave',
  },
]

export function isDoctorOnLeave(doctorName: string, now: Date = new Date()): DoctorLeave | null {
  const leave = doctorLeaves.find((entry) => entry.doctorName === doctorName)
  if (!leave) {
    return null
  }

  const untilDate = new Date(`${leave.until}T23:59:59`)
  return untilDate >= now ? leave : null
}

export function formatLeaveDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

