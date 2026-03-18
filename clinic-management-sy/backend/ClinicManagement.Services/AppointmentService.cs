using ClinicManagement.Core.Exceptions;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Services;

public sealed class AppointmentService : IAppointmentService
{

    private static readonly IReadOnlyDictionary<AppointmentStatus, IReadOnlyList<AppointmentStatus>>
        AllowedTransitions = new Dictionary<AppointmentStatus, IReadOnlyList<AppointmentStatus>>
        {
            [AppointmentStatus.Scheduled] = new[] { AppointmentStatus.Confirmed, AppointmentStatus.Cancelled },
            [AppointmentStatus.New]       = new[] { AppointmentStatus.Confirmed, AppointmentStatus.Cancelled },
            [AppointmentStatus.Confirmed] = new[] { AppointmentStatus.Completed, AppointmentStatus.Cancelled },
            [AppointmentStatus.Completed] = Array.Empty<AppointmentStatus>(),
            [AppointmentStatus.Cancelled] = Array.Empty<AppointmentStatus>(),
        };

    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPatientRepository _patientRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IPatientRepository patientRepository)
    {
        _appointmentRepository = appointmentRepository;
        _patientRepository = patientRepository;
    }

    public Task<IReadOnlyList<Appointment>> GetAllAppointmentsAsync()
        => _appointmentRepository.GetAllAsync();

    public async Task<Appointment> GetAppointmentByIdAsync(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        return appointment ?? throw new KeyNotFoundException($"Appointment with ID '{id}' was not found.");
    }

    public async Task<Appointment> BookAppointmentAsync(Appointment appointment)
    {
        await ValidateAppointmentAsync(appointment);

        var existingAppointment = await _appointmentRepository.FindByDoctorAndDateTimeAsync(
            appointment.DoctorName, appointment.AppointmentDateTime);
        if (existingAppointment != null && existingAppointment.Id != appointment.Id)
        {
            throw new DoubleBookingException(appointment.DoctorName, appointment.AppointmentDateTime);
        }

        return await _appointmentRepository.AddAsync(appointment);
    }

    public async Task<Appointment> UpdateStatusAsync(int appointmentId, AppointmentStatus newStatus)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
        if (appointment == null)
        {
            throw new KeyNotFoundException($"Appointment with ID '{appointmentId}' was not found.");
        }

        appointment.Status = newStatus;
        return await _appointmentRepository.UpdateAsync(appointment);
    }

    public async Task<int> GetAppointmentCountAsync()
    {
        var appointments = await _appointmentRepository.GetAllAsync();
        return appointments.Count;
    }

    public Task<IReadOnlyList<CompletedCheckup>> GetCompletedCheckupsAsync(int? patientId = null)
        => _appointmentRepository.GetCompletedCheckupsAsync(patientId);

    public Task<int> GetCompletedCheckupCountAsync()
        => _appointmentRepository.GetCompletedCheckupCountAsync();

    private async Task ValidateAppointmentAsync(Appointment appointment)
    {
        if (appointment.PatientId == 0)
            throw new ValidationException(nameof(appointment.PatientId), "Patient ID is required.");

        var patientExists = await _patientRepository.GetByIdAsync(appointment.PatientId);
        if (patientExists is null)
            throw new ValidationException(nameof(appointment.PatientId),
                $"Patient with ID '{appointment.PatientId}' does not exist.");

        if (string.IsNullOrWhiteSpace(appointment.DoctorName))
            throw new ValidationException(nameof(appointment.DoctorName), "Doctor name is required.");

        if (appointment.AppointmentDateTime <= DateTime.UtcNow)
            throw new ValidationException(nameof(appointment.AppointmentDateTime),
                "Appointment must be scheduled in the future.");
    }
}

