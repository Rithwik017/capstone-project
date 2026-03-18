using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Infrastructure.Data
{
    public class SqlAppointmentRepository : IAppointmentRepository
    {
        private readonly ClinicDbContext _context;

        public SqlAppointmentRepository(ClinicDbContext context)
        {
            _context = context;
        }

        public async Task<Appointment> AddAsync(Appointment appointment)
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.FullName == appointment.DoctorName);

            if (doctor == null)
            {
                throw new InvalidOperationException($"Doctor '{appointment.DoctorName}' not found.");
            }

            appointment.DoctorId = doctor.Id;
            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            appointment.DoctorName = doctor.FullName;
            return appointment;
        }

        public async Task DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Appointment?> FindByDoctorAndDateTimeAsync(string doctorName, DateTime appointmentDateTime)
        {
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.FullName == doctorName);

            if (doctor == null)
            {
                return null;
            }

            var match = await _context.Appointments
                .FirstOrDefaultAsync(a => a.DoctorId == doctor.Id && a.AppointmentDateTime == appointmentDateTime);

            if (match != null)
            {
                match.DoctorName = doctor.FullName;
            }

            return match;
        }

        public async Task<IReadOnlyList<Appointment>> FindByPatientIdAsync(int patientId)
        {
            return await _context.Appointments.Where(a => a.PatientId == patientId).ToListAsync();
        }

        public async Task<IReadOnlyList<Appointment>> GetAllAsync()
        {
            var appointments = await _context.Appointments.ToListAsync();
            var doctors = await _context.Doctors
                .AsNoTracking()
                .ToDictionaryAsync(d => d.Id, d => d.FullName);

            foreach (var appointment in appointments)
            {
                if (doctors.TryGetValue(appointment.DoctorId, out var doctorName))
                {
                    appointment.DoctorName = doctorName;
                }
            }

            return appointments;
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return null;
            }

            var doctor = await _context.Doctors
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == appointment.DoctorId);
            appointment.DoctorName = doctor?.FullName ?? string.Empty;
            return appointment;
        }

        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            if (!string.IsNullOrWhiteSpace(appointment.DoctorName))
            {
                var doctor = await _context.Doctors
                    .FirstOrDefaultAsync(d => d.FullName == appointment.DoctorName);
                if (doctor != null)
                {
                    appointment.DoctorId = doctor.Id;
                }
            }

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            if (appointment.DoctorId != 0)
            {
                var doctor = await _context.Doctors
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == appointment.DoctorId);
                appointment.DoctorName = doctor?.FullName ?? appointment.DoctorName;
            }

            return appointment;
        }

        public async Task<IReadOnlyList<CompletedCheckup>> GetCompletedCheckupsAsync(int? patientId = null)
        {
            const string sql = @"
SELECT
    cc.CheckupID AS CheckupId,
    cc.PatientID AS PatientId,
    ISNULL(d.FullName, 'Unknown Doctor') AS DoctorName,
    ISNULL(cc.VisitReason, 'N/A') AS VisitReason
FROM CompletedCheckups cc
LEFT JOIN Doctors d ON d.DoctorID = cc.DoctorID
WHERE (@patientId IS NULL OR cc.PatientID = @patientId)
ORDER BY cc.CheckupID DESC;";

            var connection = _context.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            var patientParam = new SqlParameter("@patientId", patientId.HasValue ? patientId.Value : DBNull.Value)
            {
                IsNullable = true
            };
            command.Parameters.Add(patientParam);

            var results = new List<CompletedCheckup>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new CompletedCheckup
                {
                    CheckupId = reader.GetInt32(reader.GetOrdinal("CheckupId")),
                    PatientId = reader.GetInt32(reader.GetOrdinal("PatientId")),
                    DoctorName = reader.GetString(reader.GetOrdinal("DoctorName")),
                    VisitReason = reader.GetString(reader.GetOrdinal("VisitReason")),
                    CompletedDate = null,
                });
            }

            return results;
        }

        public async Task<int> GetCompletedCheckupCountAsync()
        {
            const string sql = "SELECT COUNT(1) FROM CompletedCheckups;";

            var connection = _context.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = sql;

            var scalar = await command.ExecuteScalarAsync();
            return Convert.ToInt32(scalar);
        }
    }
}

