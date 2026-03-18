using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Infrastructure.Data
{
    public class SqlPatientRepository : IPatientRepository
    {
        private readonly ClinicDbContext _context;

        public SqlPatientRepository(ClinicDbContext context)
        {
            _context = context;
        }

        public async Task<Patient> AddAsync(Patient patient)
        {
            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task DeleteAsync(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient != null)
            {
                _context.Patients.Remove(patient);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Patient?> GetByIdAsync(int id)
        {
            return await _context.Patients.FindAsync(id);
        }

        public async Task<IReadOnlyList<Patient>> GetAllAsync()
        {
            return await _context.Patients.ToListAsync();
        }

        public async Task<Patient> UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task<Patient?> FindByEmailAsync(string email)
        {
            return await _context.Patients.FirstOrDefaultAsync(p => p.Email == email);
        }

        public async Task<Patient?> FindByPhoneAsync(string phone)
        {
            return await _context.Patients.FirstOrDefaultAsync(p => p.PhoneNumber == phone);
        }
    }
}

