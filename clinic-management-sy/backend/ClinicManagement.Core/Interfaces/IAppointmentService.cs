using ClinicManagement.Core.Models;

namespace ClinicManagement.Core.Interfaces;

public interface IAppointmentService
{
    Task<IReadOnlyList<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment> GetAppointmentByIdAsync(int id);
    Task<Appointment> BookAppointmentAsync(Appointment appointment);
    Task<Appointment> UpdateStatusAsync(int appointmentId, AppointmentStatus newStatus);
    Task<int> GetAppointmentCountAsync();
    Task<IReadOnlyList<CompletedCheckup>> GetCompletedCheckupsAsync(int? patientId = null);
    Task<int> GetCompletedCheckupCountAsync();
}

