using Microsoft.EntityFrameworkCore;
using ClinicManagement.Core.Models;

namespace ClinicManagement.Infrastructure.Data
{
    public class ClinicDbContext : DbContext
    {
        public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Department> Departments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.ToTable("Patients");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).HasColumnName("PatientID").ValueGeneratedOnAdd();
                entity.Property(p => p.PhoneNumber).HasColumnName("Phone");
                entity.Ignore(p => p.RegistrationDate);
            });

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("Appointments");
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Id).HasColumnName("AppointmentID").ValueGeneratedOnAdd();
                entity.Property(a => a.PatientId).HasColumnName("PatientID");
                entity.Property(a => a.DoctorId).HasColumnName("DoctorID");
                entity.Property(a => a.AppointmentDateTime).HasColumnName("ScheduledTime");
                entity.Property(a => a.Status).HasConversion<string>();
                entity.Ignore(a => a.DoctorName);
                entity.Ignore(a => a.CreatedAt);
                entity.Ignore(a => a.UpdatedAt);
            });

            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.ToTable("Doctors");
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Id).HasColumnName("DoctorID").ValueGeneratedOnAdd();
                entity.Property(d => d.DepartmentId).HasColumnName("DepartmentID");
            });

            modelBuilder.Entity<Department>(entity =>
            {
                entity.ToTable("Departments");
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Id).HasColumnName("DepartmentID").ValueGeneratedOnAdd();
            });
        }
    }
}

