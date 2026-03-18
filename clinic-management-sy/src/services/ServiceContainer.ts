import { PatientRepository } from '@/repositories/PatientRepository'
import { AppointmentRepository } from '@/repositories/AppointmentRepository'
import { PatientService } from '@/services/PatientService'
import { AppointmentService } from '@/services/AppointmentService'

class ServiceContainer {
  private static instance: ServiceContainer
  private patientRepository!: PatientRepository
  private appointmentRepository!: AppointmentRepository
  private patientService!: PatientService
  private appointmentService!: AppointmentService

  private constructor() {}

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  public initialize(kvStorage: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
  }): void {
    this.patientRepository = new PatientRepository(kvStorage)
    this.appointmentRepository = new AppointmentRepository(kvStorage)

    this.patientService = new PatientService(this.patientRepository)
    this.appointmentService = new AppointmentService(
      this.appointmentRepository,
      this.patientRepository
    )
  }

  public getPatientService(): PatientService {
    if (!this.patientService) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.')
    }
    return this.patientService
  }

  public getAppointmentService(): AppointmentService {
    if (!this.appointmentService) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.')
    }
    return this.appointmentService
  }

  public getPatientRepository(): PatientRepository {
    if (!this.patientRepository) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.')
    }
    return this.patientRepository
  }

  public getAppointmentRepository(): AppointmentRepository {
    if (!this.appointmentRepository) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.')
    }
    return this.appointmentRepository
  }
}

export const serviceContainer = ServiceContainer.getInstance()

