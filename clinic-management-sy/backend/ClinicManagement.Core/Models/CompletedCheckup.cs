namespace ClinicManagement.Core.Models;

public sealed class CompletedCheckup
{
    public int CheckupId { get; set; }
    public int PatientId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string VisitReason { get; set; } = string.Empty;
    public DateTime? CompletedDate { get; set; }
}

