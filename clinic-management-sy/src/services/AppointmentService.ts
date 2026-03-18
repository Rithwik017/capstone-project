import { Appointment, AppointmentStatus } from '@/models/Appointment'
import { AppointmentRepository } from '@/repositories/AppointmentRepository'
import { PatientRepository } from '@/repositories/PatientRepository'
import {
  ValidationException,
  EntityNotFoundException,
  DoubleBookingException,
  InvalidStatusTransitionException
} from '@/exceptions/CustomExceptions'

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  public async getAllAppointments(): Promise<Appointment[]> {
    return await this.appointmentRepository.getAll()
  }

  public async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.getById(id)

    if (!appointment) {
      throw new EntityNotFoundException('Appointment', id)
    }

    return appointment
  }

  public async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.findByPatientId(patientId)
  }

  public async bookAppointment(
    patientId: string,
    doctorName: string,
    appointmentDateTime: string,
    notes?: string
  ): Promise<Appointment> {
    await this.validateAppointmentData(patientId, doctorName, appointmentDateTime)

    await this.checkForDoubleBooking(doctorName, appointmentDateTime)

    const appointment = new Appointment(patientId, doctorName, appointmentDateTime, notes)
    return await this.appointmentRepository.create(appointment)
  }

  public async updateAppointmentStatus(
    appointmentId: string,
    newStatus: AppointmentStatus
  ): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId)

    if (!appointment.canTransitionTo(newStatus)) {
      throw new InvalidStatusTransitionException(appointment.status, newStatus)
    }

    appointment.updateStatus(newStatus)
    return await this.appointmentRepository.update(appointmentId, appointment)
  }

  public async rescheduleAppointment(
    appointmentId: string,
    newDateTime: string
  ): Promise<Appointment> {
    const appointment = await this.getAppointmentById(appointmentId)

    if (appointment.status === AppointmentStatus.Completed || 
        appointment.status === AppointmentStatus.Cancelled) {
      throw new ValidationException({
        status: `Cannot reschedule ${appointment.status.toLowerCase()} appointments`
      })
    }

    this.validateDateTime(newDateTime)

    await this.checkForDoubleBooking(appointment.doctorName, newDateTime, appointmentId)

    appointment.appointmentDateTime = newDateTime
    appointment.updatedAt = new Date().toISOString()

    return await this.appointmentRepository.update(appointmentId, appointment)
  }

  public async cancelAppointment(appointmentId: string): Promise<Appointment> {
    return await this.updateAppointmentStatus(appointmentId, AppointmentStatus.Cancelled)
  }

  public async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.getAppointmentById(id)
    await this.appointmentRepository.delete(appointment.id)
  }

  private async validateAppointmentData(
    patientId: string,
    doctorName: string,
    appointmentDateTime: string
  ): Promise<void> {
    const errors: Record<string, string> = {}

    const patientExists = await this.patientRepository.exists(patientId)
    if (!patientExists) {
      errors.patientId = 'Patient does not exist'
    }

    if (!doctorName || doctorName.trim().length === 0) {
      errors.doctorName = 'Doctor name is required'
    }

    if (!appointmentDateTime) {
      errors.appointmentDateTime = 'Appointment date and time is required'
    } else {
      try {
        this.validateDateTime(appointmentDateTime)
      } catch (error) {
        if (error instanceof ValidationException) {
          Object.assign(errors, error.fieldErrors)
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors)
    }
  }

  private validateDateTime(dateTimeString: string): void {
    const appointmentDate = new Date(dateTimeString)
    const now = new Date()

    if (isNaN(appointmentDate.getTime())) {
      throw new ValidationException({
        appointmentDateTime: 'Invalid date and time format'
      })
    }

    if (appointmentDate < now) {
      throw new ValidationException({
        appointmentDateTime: 'Appointment cannot be scheduled in the past'
      })
    }
  }

  private async checkForDoubleBooking(
    doctorName: string,
    appointmentDateTime: string,
    excludeAppointmentId?: string
  ): Promise<void> {
    const existingAppointment = await this.appointmentRepository.findByDoctorAndDateTime(
      doctorName,
      appointmentDateTime
    )

    if (existingAppointment && existingAppointment.id !== excludeAppointmentId) {
      if (existingAppointment.status !== AppointmentStatus.Cancelled) {
        throw new DoubleBookingException(doctorName, appointmentDateTime)
      }
    }
  }
}

