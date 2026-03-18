import { Appointment, IAppointment } from '@/models/Appointment'
import { IRepository } from './IRepository'

export class AppointmentRepository implements IRepository<Appointment> {
  private readonly storageKey = 'clinic_appointments'

  constructor(private readonly kvStorage: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
  }) {}

  public async getAll(): Promise<Appointment[]> {
    const appointmentsData = await this.kvStorage.get<IAppointment[]>(this.storageKey)

    if (!appointmentsData || !Array.isArray(appointmentsData)) {
      return []
    }

    return appointmentsData.map(data => Appointment.fromJson(data))
  }

  public async getById(id: string): Promise<Appointment | undefined> {
    const appointments = await this.getAll()
    return appointments.find(appointment => appointment.id === id)
  }

  public async create(appointment: Appointment): Promise<Appointment> {
    const appointments = await this.getAll()
    appointments.push(appointment)
    await this.saveAll(appointments)
    return appointment
  }

  public async update(id: string, updatedAppointment: Appointment): Promise<Appointment> {
    const appointments = await this.getAll()
    const index = appointments.findIndex(appointment => appointment.id === id)

    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`)
    }

    appointments[index] = updatedAppointment
    await this.saveAll(appointments)
    return updatedAppointment
  }

  public async delete(id: string): Promise<void> {
    const appointments = await this.getAll()
    const filteredAppointments = appointments.filter(appointment => appointment.id !== id)
    await this.saveAll(filteredAppointments)
  }

  public async exists(id: string): Promise<boolean> {
    const appointment = await this.getById(id)
    return appointment !== undefined
  }

  public async findByPatientId(patientId: string): Promise<Appointment[]> {
    const appointments = await this.getAll()
    return appointments.filter(appointment => appointment.patientId === patientId)
  }

  public async findByDoctorAndDateTime(doctorName: string, dateTime: string): Promise<Appointment | undefined> {
    const appointments = await this.getAll()
    return appointments.find(
      appointment => 
        appointment.doctorName === doctorName && 
        appointment.appointmentDateTime === dateTime
    )
  }

  public async findByDoctor(doctorName: string): Promise<Appointment[]> {
    const appointments = await this.getAll()
    return appointments.filter(appointment => appointment.doctorName === doctorName)
  }

  private async saveAll(appointments: Appointment[]): Promise<void> {
    const appointmentsData = appointments.map(appointment => appointment.toJson())
    await this.kvStorage.set(this.storageKey, appointmentsData)
  }
}

