using ClinicManagement.Core.Exceptions;
using ClinicManagement.Core.Models;
using ClinicManagement.Infrastructure.InMemory;
using ClinicManagement.Services;
using Xunit;

namespace ClinicManagement.Tests;

public sealed class AppointmentServiceTests
{

    private static AppointmentService CreateService(out PatientRepository patientRepo)
    {
        patientRepo = new PatientRepository();
        var appointmentRepo = new AppointmentRepository();
        return new AppointmentService(appointmentRepo, patientRepo);
    }

    private static Patient BuildPatient() => new()
    {
        FirstName = "Jane",
        LastName  = "Doe",
        Email     = "jane.doe@example.com",
        PhoneNumber = "555-0100",
        DateOfBirth = new DateOnly(1990, 1, 15)
    };

    private static Appointment BuildAppointment(int patientId, string doctorName, DateTime dateTime) =>
        new()
        {
            PatientId           = patientId,
            DoctorName          = doctorName,
            AppointmentDateTime = dateTime,
        };

    [Fact]
    public async Task BookAppointment_SameDoctorSameTime_ThrowsDoubleBookingException()
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var dateTime = DateTime.UtcNow.AddDays(1);
        var first = BuildAppointment(patient.Id, "Dr. Smith", dateTime);
        await service.BookAppointmentAsync(first);

        var duplicate = BuildAppointment(patient.Id, "Dr. Smith", dateTime);

        await Assert.ThrowsAsync<DoubleBookingException>(
            () => service.BookAppointmentAsync(duplicate));
    }

    [Fact]
    public async Task BookAppointment_SameDoctorDifferentTime_Succeeds()
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var first  = BuildAppointment(patient.Id, "Dr. Smith", DateTime.UtcNow.AddDays(1));
        var second = BuildAppointment(patient.Id, "Dr. Smith", DateTime.UtcNow.AddDays(2));

        await service.BookAppointmentAsync(first);
        var result = await service.BookAppointmentAsync(second);

        Assert.NotNull(result);
    }

    [Fact]
    public async Task BookAppointment_DifferentDoctorSameTime_Succeeds()
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var dateTime = DateTime.UtcNow.AddDays(1);
        var first  = BuildAppointment(patient.Id, "Dr. Smith",  dateTime);
        var second = BuildAppointment(patient.Id, "Dr. Johnson", dateTime);

        await service.BookAppointmentAsync(first);
        var result = await service.BookAppointmentAsync(second);

        Assert.NotNull(result);
    }

    [Theory]
    [InlineData(AppointmentStatus.New,       AppointmentStatus.Confirmed)]
    [InlineData(AppointmentStatus.New,       AppointmentStatus.Cancelled)]
    [InlineData(AppointmentStatus.Confirmed, AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.Confirmed, AppointmentStatus.Cancelled)]
    public async Task UpdateStatus_ValidTransition_Succeeds(
        AppointmentStatus from, AppointmentStatus to)
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var appointment = BuildAppointment(patient.Id, "Dr. Smith", DateTime.UtcNow.AddDays(1));
        var created = await service.BookAppointmentAsync(appointment);

        if (from != AppointmentStatus.New)
        {
            created = await service.UpdateStatusAsync(created.Id, AppointmentStatus.Confirmed);
        }

        var updated = await service.UpdateStatusAsync(created.Id, to);
        Assert.Equal(to, updated.Status);
    }

    [Theory]
    [InlineData(AppointmentStatus.New,       AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.Completed, AppointmentStatus.Confirmed)]
    [InlineData(AppointmentStatus.Cancelled, AppointmentStatus.New)]
    [InlineData(AppointmentStatus.Cancelled, AppointmentStatus.Confirmed)]
    public async Task UpdateStatus_InvalidTransition_ThrowsInvalidStatusTransitionException(
        AppointmentStatus from, AppointmentStatus to)
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var appointment = BuildAppointment(patient.Id, "Dr. Smith", DateTime.UtcNow.AddDays(1));
        var created = await service.BookAppointmentAsync(appointment);

        if (from == AppointmentStatus.Confirmed)
            created = await service.UpdateStatusAsync(created.Id, AppointmentStatus.Confirmed);
        else if (from == AppointmentStatus.Completed)
        {
            created = await service.UpdateStatusAsync(created.Id, AppointmentStatus.Confirmed);
            created = await service.UpdateStatusAsync(created.Id, AppointmentStatus.Completed);
        }
        else if (from == AppointmentStatus.Cancelled)
            created = await service.UpdateStatusAsync(created.Id, AppointmentStatus.Cancelled);

        await Assert.ThrowsAsync<InvalidStatusTransitionException>(
            () => service.UpdateStatusAsync(created.Id, to));
    }

    [Fact]
    public async Task BookAppointment_PastDateTime_ThrowsValidationException()
    {
        var service = CreateService(out var patientRepo);
        var patient = await patientRepo.AddAsync(BuildPatient());

        var pastAppointment = BuildAppointment(patient.Id, "Dr. Smith", DateTime.UtcNow.AddDays(-1));

        await Assert.ThrowsAsync<ValidationException>(
            () => service.BookAppointmentAsync(pastAppointment));
    }

    [Fact]
    public async Task BookAppointment_UnknownPatient_ThrowsValidationException()
    {
        var service = CreateService(out _);

        var appointment = BuildAppointment(0, "Dr. Smith", DateTime.UtcNow.AddDays(1));

        await Assert.ThrowsAsync<ValidationException>(
            () => service.BookAppointmentAsync(appointment));
    }
}

