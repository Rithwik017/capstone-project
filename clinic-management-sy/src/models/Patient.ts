export interface IPatient {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  registrationDate: string
}

export class Patient implements IPatient {
  public readonly id: string
  public firstName: string
  public lastName: string
  public email: string
  public phoneNumber: string
  public dateOfBirth: string
  public readonly registrationDate: string

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    dateOfBirth: string,
    id?: string,
    registrationDate?: string
  ) {
    this.id = id ?? this.generateId()
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.phoneNumber = phoneNumber
    this.dateOfBirth = dateOfBirth
    this.registrationDate = registrationDate ?? new Date().toISOString()
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  public getAge(): number {
    const birthDate = new Date(this.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  private generateId(): string {
    return `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }

  public static fromJson(json: IPatient): Patient {
    return new Patient(
      json.firstName,
      json.lastName,
      json.email,
      json.phoneNumber,
      json.dateOfBirth,
      json.id,
      json.registrationDate
    )
  }

  public toJson(): IPatient {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      dateOfBirth: this.dateOfBirth,
      registrationDate: this.registrationDate
    }
  }
}

