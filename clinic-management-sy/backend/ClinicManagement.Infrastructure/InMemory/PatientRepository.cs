using System.Collections.Concurrent;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Infrastructure.InMemory;

public sealed class PatientRepository : IPatientRepository
{
    private readonly ConcurrentDictionary<int, Patient> _store = new();

    public Task<IReadOnlyList<Patient>> GetAllAsync()
    {
        IReadOnlyList<Patient> result = _store.Values.ToList();
        return Task.FromResult(result);
    }

    public Task<Patient?> GetByIdAsync(int id)
    {
        _store.TryGetValue(id, out var patient);
        return Task.FromResult(patient);
    }

    public Task<Patient> AddAsync(Patient entity)
    {
        _store[entity.Id] = entity;
        return Task.FromResult(entity);
    }

    public Task<Patient> UpdateAsync(Patient entity)
    {
        _store[entity.Id] = entity;
        return Task.FromResult(entity);
    }

    public Task DeleteAsync(int id)
    {
        _store.Remove(id, out _);
        return Task.CompletedTask;
    }

    public Task<Patient?> FindByEmailAsync(string email)
    {
        var patient = _store.Values.FirstOrDefault(
            p => p.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(patient);
    }

    public Task<Patient?> FindByPhoneAsync(string phone)
    {
        var patient = _store.Values.FirstOrDefault(p => p.PhoneNumber == phone);
        return Task.FromResult(patient);
    }
}

