using ClinicManagement.Core.Interfaces;
using ClinicManagement.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers;

[ApiController]
[Route("api/patients")]
public sealed class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<Patient>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var patients = await _patientService.GetAllPatientsAsync();
        return Ok(patients);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Patient), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] Patient patient)
    {
        var created = await _patientService.RegisterPatientAsync(patient);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Patient), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        return Ok(patient);
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(Patient), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SearchByPhone([FromQuery] string phone)
    {
        var patient = await _patientService.GetPatientByPhoneAsync(phone);
        if (patient == null)
        {
            return NotFound();
        }
        return Ok(patient);
    }
}

