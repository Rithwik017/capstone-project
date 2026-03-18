namespace ClinicManagement.Core.Models;

public sealed class Patient
{
    public int Id { get; set; } 
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public DateTime RegistrationDate { get; init; }

    public string FullName => $"{FirstName} {LastName}";

    public Patient()
    {
        Id = 0; 
        RegistrationDate = DateTime.UtcNow;
    }
}

