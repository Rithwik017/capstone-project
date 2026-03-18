
import type {
  Patient,
  Appointment,
  AppointmentStatus,
  CreatePatientDto,
  CreateAppointmentDto,
  ApiError,
} from './interfaces.js';

export interface DepartmentDto {
  id: number;
  name: string;
}

export interface DoctorDto {
  id: number;
  fullName: string;
  departmentId: number;
  department: string;
}

const BASE_URL = 'http://localhost:5000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = (await response.json()) as ApiError;
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    throw new Error(apiError.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getPatients(): Promise<Patient[]> {
  return request<Patient[]>('/api/patients');
}

export function createPatient(dto: CreatePatientDto): Promise<Patient> {
  return request<Patient>('/api/patients', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function getDepartments(): Promise<DepartmentDto[]> {
  return request<DepartmentDto[]>('/api/departments');
}

export function getDoctors(): Promise<DoctorDto[]> {
  return request<DoctorDto[]>('/api/doctors');
}

export function getAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/api/appointments');
}

export function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  return request<Appointment>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateAppointmentStatus(
  id: number,
  status: AppointmentStatus
): Promise<Appointment> {
  return request<Appointment>(`/api/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

