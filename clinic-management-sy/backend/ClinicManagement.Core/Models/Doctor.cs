namespace ClinicManagement.Core.Models;

public sealed class Doctor
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
}

