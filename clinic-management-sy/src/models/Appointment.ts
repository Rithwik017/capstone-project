export enum AppointmentStatus {
  New = 'New',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface IAppointment {
  id: string
  patientId: string
  doctorName: string
  appointmentDateTime: string
  status: AppointmentStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export class Appointment implements IAppointment {
  public readonly id: string
  public patientId: string
  public doctorName: string
  public appointmentDateTime: string
  public status: AppointmentStatus
  public notes?: string
  public readonly createdAt: string
  public updatedAt: string

  constructor(
    patientId: string,
    doctorName: string,
    appointmentDateTime: string,
    notes?: string,
    status?: AppointmentStatus,
    id?: string,
    createdAt?: string,
    updatedAt?: string
  ) {
    this.id = id ?? this.generateId()
    this.patientId = patientId
    this.doctorName = doctorName
    this.appointmentDateTime = appointmentDateTime
    this.status = status ?? AppointmentStatus.New
    this.notes = notes
    this.createdAt = createdAt ?? new Date().toISOString()
    this.updatedAt = updatedAt ?? new Date().toISOString()
  }

  public canTransitionTo(newStatus: AppointmentStatus): boolean {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.New]: [
        AppointmentStatus.Confirmed,
        AppointmentStatus.Cancelled
      ],
      [AppointmentStatus.Confirmed]: [
        AppointmentStatus.Completed,
        AppointmentStatus.Cancelled
      ],
      [AppointmentStatus.Completed]: [],
      [AppointmentStatus.Cancelled]: []
    }

    return validTransitions[this.status].includes(newStatus)
  }

  public updateStatus(newStatus: AppointmentStatus): void {
    this.status = newStatus
    this.updatedAt = new Date().toISOString()
  }

  public isUpcoming(): boolean {
    return new Date(this.appointmentDateTime) > new Date() &&
      (this.status === AppointmentStatus.New || this.status === AppointmentStatus.Confirmed)
  }

  private generateId(): string {
    return `APT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }

  public static fromJson(json: IAppointment): Appointment {
    return new Appointment(
      json.patientId,
      json.doctorName,
      json.appointmentDateTime,
      json.notes,
      json.status,
      json.id,
      json.createdAt,
      json.updatedAt
    )
  }

  public toJson(): IAppointment {
    return {
      id: this.id,
      patientId: this.patientId,
      doctorName: this.doctorName,
      appointmentDateTime: this.appointmentDateTime,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

