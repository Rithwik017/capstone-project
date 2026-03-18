using ClinicManagement.Core.Models;

namespace ClinicManagement.Core.Interfaces;

public interface IPatientRepository : IRepository<Patient>
{
    Task<Patient?> FindByEmailAsync(string email);
    Task<Patient?> FindByPhoneAsync(string phone);
}

