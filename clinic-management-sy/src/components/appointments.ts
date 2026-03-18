
import { getAppointments, createAppointment, getPatients, updateAppointmentStatus } from '../api.js';
import type { Appointment, Patient, CreateAppointmentDto } from '../interfaces.js';
import { AppointmentStatus } from '../interfaces.js';

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

function statusBadge(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.New]:       'bg-secondary',
    [AppointmentStatus.Confirmed]: 'bg-primary',
    [AppointmentStatus.Completed]: 'bg-success',
    [AppointmentStatus.Cancelled]: 'bg-danger',
  };
  return `<span class="badge ${map[status]}">${status}</span>`;
}

function renderAppointmentRow(appointment: Appointment, patientMap: Map<string, Patient>): string {
  const patient  = patientMap.get(appointment.patientId);
  const patName  = patient ? `${patient.firstName} ${patient.lastName}` : appointment.patientId;
  const dateStr  = new Date(appointment.appointmentDateTime).toLocaleString();

  return `
    <tr>
      <td>${patName}</td>
      <td>${appointment.doctorName}</td>
      <td>${dateStr}</td>
      <td>${statusBadge(appointment.status)}</td>
      <td>${appointment.notes ?? '—'}</td>
      <td>
        ${buildStatusActions(appointment)}
      </td>
    </tr>`;
}

function buildStatusActions(appointment: Appointment): string {
  return '—';
}

export async function renderAppointments(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <h2 class="mb-4">Appointments</h2>

    <div id="appointments-feedback"></div>

    <!-- Book form -->
    <div class="card mb-4">
      <div class="card-header fw-semibold">Book New Appointment</div>
      <div class="card-body">
        <form id="appointment-form" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="a-patient">Patient</label>
              <select id="a-patient" name="patientId" class="form-select" required>
                <option value="">— select patient —</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="a-doctor">Doctor Name</label>
              <input id="a-doctor" name="doctorName" type="text" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="a-datetime">Date &amp; Time</label>
              <input id="a-datetime" name="appointmentDateTime" type="datetime-local"
                     class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="a-notes">Notes (optional)</label>
              <input id="a-notes" name="notes" type="text" class="form-control" />
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary">Book Appointment</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Appointment list -->
    <div class="card">
      <div class="card-header fw-semibold">All Appointments</div>
      <div class="card-body p-0">
        <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Patient</th><th>Doctor</th><th>Date &amp; Time</th>
              <th>Status</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody id="appointments-tbody"></tbody>
        </table>
      </div>
    </div>`;

  await populatePatientSelect();
  await loadAppointmentList();
  bindAppointmentForm();

}

async function populatePatientSelect(): Promise<void> {
  const select = document.getElementById('a-patient') as HTMLSelectElement | null;
  if (!select) return;
  try {
    const patients = await getPatients();
    patients.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.firstName} ${p.lastName}`;
      select.appendChild(opt);
    });
  } catch {

  }
}

let patientCache: Map<string, Patient> = new Map();

async function loadAppointmentList(): Promise<void> {
  const tbody = document.getElementById('appointments-tbody');
  if (!tbody) return;

  try {
    const [appointments, patients] = await Promise.all([getAppointments(), getPatients()]);
    patientCache = new Map(patients.map((p) => [p.id, p]));

    tbody.innerHTML = appointments.length
      ? appointments.map((a) => renderAppointmentRow(a, patientCache)).join('')
      : '<tr><td colspan="6" class="text-center text-muted py-3">No appointments booked yet.</td></tr>';
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Failed to load appointments.</td></tr>';
  }
}

function bindAppointmentForm(): void {
  const form = document.getElementById('appointment-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const data = new FormData(form);

    const localDt = data.get('appointmentDateTime') as string;
    const isoDateTime = localDt ? new Date(localDt).toISOString() : '';

    const dto: CreateAppointmentDto = {
      patientId:           data.get('patientId') as string,
      doctorName:          (data.get('doctorName') as string).trim(),
      appointmentDateTime: isoDateTime,
      notes:               (data.get('notes') as string).trim() || undefined,
    };

    try {
      await createAppointment(dto);
      showSuccess('appointments-feedback', 'Appointment booked successfully.');
      form.reset();
      form.classList.remove('was-validated');
      await loadAppointmentList();
    } catch (err) {
      showError('appointments-feedback', (err as Error).message);
    }
  });
}

