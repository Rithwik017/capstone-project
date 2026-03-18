using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Infrastructure.Data;

namespace ClinicManagement.Api.Controllers;

[ApiController]
[Route("api/doctors")]
public sealed class DoctorsController : ControllerBase
{
    private readonly ClinicDbContext _db;

    public DoctorsController(ClinicDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var doctors = await (
            from doctor in _db.Doctors
            join department in _db.Departments on doctor.DepartmentId equals department.Id into deptGroup
            from department in deptGroup.DefaultIfEmpty()
            select new
            {
                id = doctor.Id,
                departmentId = doctor.DepartmentId,
                fullName = doctor.FullName,
                department = department != null ? department.Name : "General"
            }
        )
            .AsNoTracking()
            .OrderBy(d => d.fullName)
            .ToListAsync();

        return Ok(doctors);
    }
}

