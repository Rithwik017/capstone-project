
import { getPatients, createPatient } from '../api.js';
import type { Patient, CreatePatientDto } from '../interfaces.js';

function showError(containerId: string, message: string): void {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function showSuccess(containerId: string, message: string): void {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function renderPatientRow(patient: Patient): string {
  const dob  = new Date(patient.dateOfBirth).toLocaleDateString();
  const reg  = new Date(patient.registrationDate).toLocaleDateString();
  const name = `${patient.firstName} ${patient.lastName}`;
  return `
    <tr>
      <td>${name}</td>
      <td>${patient.email}</td>
      <td>${patient.phoneNumber}</td>
      <td>${dob}</td>
      <td>${reg}</td>
    </tr>`;
}

export async function renderPatients(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <h2 class="mb-4">Patients</h2>

    <div id="patients-feedback"></div>

    <!-- Register form -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">Register New Patient</div>
      <div class="card-body">
        <form id="patient-form" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="p-firstName">First Name</label>
              <input id="p-firstName" name="firstName" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="p-lastName">Last Name</label>
              <input id="p-lastName" name="lastName" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="p-email">Email</label>
              <input id="p-email" name="email" type="email" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="p-phone">Phone Number</label>
              <input id="p-phone" name="phoneNumber" type="tel" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="p-dob">Date of Birth</label>
              <input id="p-dob" name="dateOfBirth" type="date" class="form-control" required />
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary">Register Patient</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Patient list -->
    <div class="card">
      <div class="card-header fw-semibold">Registered Patients</div>
      <div class="card-body p-0">
        <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Date of Birth</th><th>Registered</th>
            </tr>
          </thead>
          <tbody id="patients-tbody"></tbody>
        </table>
      </div>
    </div>`;

  await loadPatientList();
  bindPatientForm();
}

async function loadPatientList(): Promise<void> {
  const tbody = document.getElementById('patients-tbody');
  if (!tbody) return;

  try {
    const patients = await getPatients();
    tbody.innerHTML = patients.length
      ? patients.map(renderPatientRow).join('')
      : '<tr><td colspan="5" class="text-center text-muted py-3">No patients registered yet.</td></tr>';
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load patients.</td></tr>';
  }
}

function bindPatientForm(): void {
  const form = document.getElementById('patient-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const data = new FormData(form);
    const dto: CreatePatientDto = {
      firstName:   (data.get('firstName')  as string).trim(),
      lastName:    (data.get('lastName')   as string).trim(),
      email:       (data.get('email')      as string).trim(),
      phoneNumber: (data.get('phoneNumber') as string).trim(),
      dateOfBirth: data.get('dateOfBirth') as string,
    };

    try {
      await createPatient(dto);
      showSuccess('patients-feedback', 'Patient registered successfully.');
      form.reset();
      form.classList.remove('was-validated');
      await loadPatientList();
    } catch (err) {
      showError('patients-feedback', (err as Error).message);
    }
  });
}

