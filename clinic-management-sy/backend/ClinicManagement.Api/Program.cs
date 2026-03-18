using ClinicManagement.Core.Exceptions;
using ClinicManagement.Core.Interfaces;
using ClinicManagement.Infrastructure.Data;
using ClinicManagement.Infrastructure.InMemory;
using ClinicManagement.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<ClinicDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});

builder.Services.AddScoped<IPatientRepository, SqlPatientRepository>();
builder.Services.AddScoped<IAppointmentRepository, SqlAppointmentRepository>();

builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                return origin.StartsWith("http://localhost:5001")
                    || origin.StartsWith("https://localhost:5001")
                    || origin.StartsWith("http://localhost:3000")
                    || origin.StartsWith("https://localhost:3000");
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features
            .Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (exceptionFeature is null) return;

        var ex = exceptionFeature.Error;
        context.Response.ContentType = "application/json";

        int statusCode;
        object errorBody;

        switch (ex)
        {
            case DoubleBookingException dbe:
                statusCode = StatusCodes.Status409Conflict;
                errorBody  = new { error = "DOUBLE_BOOKING", message = dbe.Message };
                break;
            case InvalidStatusTransitionException iste:
                statusCode = StatusCodes.Status422UnprocessableEntity;
                errorBody  = new { error = "INVALID_STATUS_TRANSITION", message = iste.Message };
                break;
            case ValidationException ve:
                statusCode = StatusCodes.Status400BadRequest;
                errorBody  = new { error = "VALIDATION_ERROR", field = ve.FieldName, message = ve.Message };
                break;
            case KeyNotFoundException knfe:
                statusCode = StatusCodes.Status404NotFound;
                errorBody  = new { error = "NOT_FOUND", message = knfe.Message };
                break;
            default:
                statusCode = StatusCodes.Status500InternalServerError;
                errorBody  = new { error = "INTERNAL_ERROR", message = "An unexpected error occurred." };
                break;
        }

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(errorBody);
    });
});

app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();

