namespace ClinicManagement.Core.Exceptions;

public sealed class ValidationException : Exception
{
    public string FieldName { get; }

    public ValidationException(string fieldName, string message)
        : base(message)
    {
        FieldName = fieldName;
    }
}

