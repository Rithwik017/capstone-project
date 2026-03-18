using System.Collections.Concurrent;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Infrastructure.InMemory;

public sealed class AppointmentRepository : IAppointmentRepository
{
    private readonly ConcurrentDictionary<int, Appointment> _store = new();

    public Task<IReadOnlyList<Appointment>> GetAllAsync()
    {
        IReadOnlyList<Appointment> result = _store.Values.ToList();
        return Task.FromResult(result);
    }

    public Task<Appointment?> GetByIdAsync(int id)
    {
        _store.TryGetValue(id, out var appointment);
        return Task.FromResult(appointment);
    }

    public Task<Appointment> AddAsync(Appointment entity)
    {
        _store[entity.Id] = entity;
        return Task.FromResult(entity);
    }

    public Task<Appointment> UpdateAsync(Appointment entity)
    {
        _store[entity.Id] = entity;
        return Task.FromResult(entity);
    }

    public Task DeleteAsync(int id)
    {
        _store.TryRemove(id, out _);
        return Task.CompletedTask;
    }

    public Task<Appointment?> FindByDoctorAndDateTimeAsync(string doctorName, DateTime appointmentDateTime)
    {
        var appointment = _store.Values.FirstOrDefault(
            a => a.DoctorName.Equals(doctorName, StringComparison.OrdinalIgnoreCase)
              && a.AppointmentDateTime == appointmentDateTime
              && a.Status != AppointmentStatus.Cancelled);
        return Task.FromResult(appointment);
    }

    public Task<IReadOnlyList<Appointment>> FindByPatientIdAsync(int patientId)
    {
        IReadOnlyList<Appointment> result = _store.Values
            .Where(a => a.PatientId == patientId)
            .ToList();
        return Task.FromResult(result);
    }

    public Task<IReadOnlyList<CompletedCheckup>> GetCompletedCheckupsAsync(int? patientId = null)
    {
        IReadOnlyList<CompletedCheckup> empty = Array.Empty<CompletedCheckup>();
        return Task.FromResult(empty);
    }

    public Task<int> GetCompletedCheckupCountAsync()
        => Task.FromResult(0);
}

