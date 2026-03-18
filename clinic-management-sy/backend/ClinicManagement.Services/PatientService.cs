using ClinicManagement.Core.Exceptions;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Services;

public sealed class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;

    public PatientService(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public Task<IReadOnlyList<Patient>> GetAllPatientsAsync()
        => _patientRepository.GetAllAsync();

    public async Task<Patient> GetPatientByIdAsync(int id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        return patient ?? throw new KeyNotFoundException($"Patient with ID '{id}' was not found.");
    }

    public async Task<Patient> RegisterPatientAsync(Patient patient)
    {
        ValidatePatient(patient);

        var existing = await _patientRepository.FindByEmailAsync(patient.Email);
        if (existing is not null)
        {
            throw new ValidationException(nameof(patient.Email),
                $"A patient with the email address '{patient.Email}' already exists.");
        }

        return await _patientRepository.AddAsync(patient);
    }

    public async Task<Patient?> GetPatientByPhoneAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ValidationException(nameof(phone), "Phone number is required.");
        }

        return await _patientRepository.FindByPhoneAsync(phone);
    }

    private static void ValidatePatient(Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.FirstName))
            throw new ValidationException(nameof(patient.FirstName), "First name is required.");

        if (string.IsNullOrWhiteSpace(patient.LastName))
            throw new ValidationException(nameof(patient.LastName), "Last name is required.");

        if (string.IsNullOrWhiteSpace(patient.Email))
            throw new ValidationException(nameof(patient.Email), "Email address is required.");

        if (string.IsNullOrWhiteSpace(patient.PhoneNumber))
            throw new ValidationException(nameof(patient.PhoneNumber), "Phone number is required.");
    }
}

