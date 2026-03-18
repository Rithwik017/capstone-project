using ClinicManagement.Core.Models;

namespace ClinicManagement.Core.Exceptions;

public sealed class InvalidStatusTransitionException : Exception
{
    public AppointmentStatus CurrentStatus { get; }
    public AppointmentStatus AttemptedStatus { get; }

    public InvalidStatusTransitionException(AppointmentStatus current, AppointmentStatus attempted)
        : base($"Invalid status transition: cannot move from '{current}' to '{attempted}'.")
    {
        CurrentStatus = current;
        AttemptedStatus = attempted;
    }
}

