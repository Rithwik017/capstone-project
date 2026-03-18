import { Patient, IPatient } from '@/models/Patient'
import { IRepository } from './IRepository'

export class PatientRepository implements IRepository<Patient> {
  private readonly storageKey = 'clinic_patients'

  constructor(private readonly kvStorage: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
  }) {}

  public async getAll(): Promise<Patient[]> {
    const patientsData = await this.kvStorage.get<IPatient[]>(this.storageKey)

    if (!patientsData || !Array.isArray(patientsData)) {
      return []
    }

    return patientsData.map(data => Patient.fromJson(data))
  }

  public async getById(id: string): Promise<Patient | undefined> {
    const patients = await this.getAll()
    return patients.find(patient => patient.id === id)
  }

  public async create(patient: Patient): Promise<Patient> {
    const patients = await this.getAll()
    patients.push(patient)
    await this.saveAll(patients)
    return patient
  }

  public async update(id: string, updatedPatient: Patient): Promise<Patient> {
    const patients = await this.getAll()
    const index = patients.findIndex(patient => patient.id === id)

    if (index === -1) {
      throw new Error(`Patient with ID ${id} not found`)
    }

    patients[index] = updatedPatient
    await this.saveAll(patients)
    return updatedPatient
  }

  public async delete(id: string): Promise<void> {
    const patients = await this.getAll()
    const filteredPatients = patients.filter(patient => patient.id !== id)
    await this.saveAll(filteredPatients)
  }

  public async exists(id: string): Promise<boolean> {
    const patient = await this.getById(id)
    return patient !== undefined
  }

  public async findByEmail(email: string): Promise<Patient | undefined> {
    const patients = await this.getAll()
    return patients.find(patient => patient.email.toLowerCase() === email.toLowerCase())
  }

  private async saveAll(patients: Patient[]): Promise<void> {
    const patientsData = patients.map(patient => patient.toJson())
    await this.kvStorage.set(this.storageKey, patientsData)
  }
}

