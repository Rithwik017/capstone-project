import { Patient } from '@/models/Patient'
import { PatientRepository } from '@/repositories/PatientRepository'
import { ValidationException, EntityNotFoundException } from '@/exceptions/CustomExceptions'

export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  public async getAllPatients(): Promise<Patient[]> {
    return await this.patientRepository.getAll()
  }

  public async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.getById(id)

    if (!patient) {
      throw new EntityNotFoundException('Patient', id)
    }

    return patient
  }

  public async registerPatient(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    dateOfBirth: string
  ): Promise<Patient> {
    this.validatePatientData(firstName, lastName, email, phoneNumber, dateOfBirth)

    const existingPatient = await this.patientRepository.findByEmail(email)
    if (existingPatient) {
      throw new ValidationException({ email: 'A patient with this email already exists' })
    }

    const patient = new Patient(firstName, lastName, email, phoneNumber, dateOfBirth)
    return await this.patientRepository.create(patient)
  }

  public async updatePatient(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    dateOfBirth: string
  ): Promise<Patient> {
    const existingPatient = await this.getPatientById(id)

    this.validatePatientData(firstName, lastName, email, phoneNumber, dateOfBirth)

    if (email !== existingPatient.email) {
      const emailTaken = await this.patientRepository.findByEmail(email)
      if (emailTaken) {
        throw new ValidationException({ email: 'A patient with this email already exists' })
      }
    }

    const updatedPatient = new Patient(
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      id,
      existingPatient.registrationDate
    )

    return await this.patientRepository.update(id, updatedPatient)
  }

  public async deletePatient(id: string): Promise<void> {
    const patient = await this.getPatientById(id)
    await this.patientRepository.delete(patient.id)
  }

  private validatePatientData(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    dateOfBirth: string
  ): void {
    const errors: Record<string, string> = {}

    if (!firstName || firstName.trim().length === 0) {
      errors.firstName = 'First name is required'
    }

    if (!lastName || lastName.trim().length === 0) {
      errors.lastName = 'Last name is required'
    }

    if (!email || !this.isValidEmail(email)) {
      errors.email = 'Valid email address is required'
    }

    if (!phoneNumber || !this.isValidPhoneNumber(phoneNumber)) {
      errors.phoneNumber = 'Valid phone number is required'
    }

    if (!dateOfBirth || !this.isValidDate(dateOfBirth)) {
      errors.dateOfBirth = 'Valid date of birth is required'
    } else {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      if (birthDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future'
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors)
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
    return phoneRegex.test(phoneNumber)
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }
}

