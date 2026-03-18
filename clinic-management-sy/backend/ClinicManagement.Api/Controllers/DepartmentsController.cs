using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Infrastructure.Data;

namespace ClinicManagement.Api.Controllers;

[ApiController]
[Route("api/departments")]
public sealed class DepartmentsController : ControllerBase
{
    private readonly ClinicDbContext _db;

    public DepartmentsController(ClinicDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments = await _db.Departments
            .AsNoTracking()
            .Select(d => new
            {
                id = d.Id,
                name = d.Name
            })
            .OrderBy(d => d.name)
            .ToListAsync();

        return Ok(departments);
    }
}

