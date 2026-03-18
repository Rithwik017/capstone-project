using ClinicManagement.Core.Models;

namespace ClinicManagement.Core.Interfaces;

public interface IAppointmentRepository : IRepository<Appointment>
{
    Task<Appointment?> FindByDoctorAndDateTimeAsync(string doctorName, DateTime appointmentDateTime);
    Task<IReadOnlyList<Appointment>> FindByPatientIdAsync(int patientId);
    Task<IReadOnlyList<CompletedCheckup>> GetCompletedCheckupsAsync(int? patientId = null);
    Task<int> GetCompletedCheckupCountAsync();
}

