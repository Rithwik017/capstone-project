
export enum AppointmentStatus {
  New       = 'New',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;  
  registrationDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  appointmentDateTime: string;  
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePatientDto = Omit<Patient, 'id' | 'registrationDate'>;

export type CreateAppointmentDto = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export interface ApiError {
  error: string;
  message: string;
  field?: string;
}

