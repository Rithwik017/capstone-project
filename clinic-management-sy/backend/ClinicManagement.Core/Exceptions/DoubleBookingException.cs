namespace ClinicManagement.Core.Exceptions;

public sealed class DoubleBookingException : Exception
{
    public string DoctorName { get; }
    public DateTime AppointmentDateTime { get; }

    public DoubleBookingException(string doctorName, DateTime appointmentDateTime)
        : base($"Double booking detected: Dr. {doctorName} is already booked at {appointmentDateTime:yyyy-MM-dd HH:mm}.")
    {
        DoctorName = doctorName;
        AppointmentDateTime = appointmentDateTime;
    }
}

