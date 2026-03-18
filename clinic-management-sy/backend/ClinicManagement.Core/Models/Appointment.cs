namespace ClinicManagement.Core.Models;

public sealed class Appointment
{
    public int Id { get; set; } 
    public int PatientId { get; set; } 
    public int DoctorId { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public string DoctorName { get; set; } = string.Empty;
    public DateTime AppointmentDateTime { get; set; }
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public DateTime CreatedAt { get; init; }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public DateTime UpdatedAt { get; set; }

    public Appointment()
    {
        Id = 0;
        Status = AppointmentStatus.New;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}

