using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<Appointment>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var appointments = await _appointmentService.GetAllAppointmentsAsync();
        return Ok(appointments);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Appointment), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] Appointment appointment)
    {
        var created = await _appointmentService.BookAppointmentAsync(appointment);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Appointment), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _appointmentService.GetAppointmentByIdAsync(id);
        return Ok(appointment);
    }

    [HttpPut("{id:int}/status")]
    [ProducesResponseType(typeof(Appointment), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var updated = await _appointmentService.UpdateStatusAsync(id, request.Status);
        return Ok(updated);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAppointmentStats()
    {
        var count = await _appointmentService.GetAppointmentCountAsync();
        return Ok(count);
    }

    [HttpGet("count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAppointmentCount()
    {
        var count = await _appointmentService.GetAppointmentCountAsync();
        return Ok(count);
    }

    [HttpGet("completed")]
    [ProducesResponseType(typeof(IReadOnlyList<CompletedCheckup>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCompleted([FromQuery] int? patientId)
    {
        var completed = await _appointmentService.GetCompletedCheckupsAsync(patientId);
        return Ok(completed);
    }

    [HttpGet("completed/count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCompletedCount()
    {
        var count = await _appointmentService.GetCompletedCheckupCountAsync();
        return Ok(count);
    }
}

public sealed record UpdateStatusRequest(AppointmentStatus Status);

