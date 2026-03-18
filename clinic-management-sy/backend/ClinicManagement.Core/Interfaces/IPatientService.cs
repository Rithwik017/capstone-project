using ClinicManagement.Core.Models;

namespace ClinicManagement.Core.Interfaces;

public interface IPatientService
{
    Task<IReadOnlyList<Patient>> GetAllPatientsAsync();
    Task<Patient> GetPatientByIdAsync(int id);
    Task<Patient> RegisterPatientAsync(Patient patient);
    Task<Patient?> GetPatientByPhoneAsync(string phone);
}

