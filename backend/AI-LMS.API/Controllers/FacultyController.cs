using AI_LMS.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacultyController : ControllerBase
{
    private readonly MongoDbContext _context;

    public FacultyController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Faculty")]
    public async Task<IActionResult> Dashboard()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var facultyProfile = await _context.Faculty
            .Find(f => f.UserId == userId)
            .FirstOrDefaultAsync();

        var coursesCount = await _context.Courses
            .CountDocumentsAsync(c => c.InstructorId == userId);

        return Ok(new
        {
            message = "Welcome to Faculty Dashboard!",
            profile = facultyProfile,
            stats = new
            {
                totalCourses = coursesCount,
                enrolledStudents = 0, // Will be linked when Enrollment model is added in Phase 5
                pendingAssignments = 0
            }
        });
    }

    /// <summary>
    /// Public/Student endpoint to view faculty directory
    /// </summary>
    [HttpGet("directory")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFacultyDirectory()
    {
        var directory = await _context.Faculty
            .Find(_ => true)
            .Project(f => new
            {
                f.Id,
                f.UserId,
                f.Name,
                f.Email,
                f.Department,
                f.Designation,
                f.ExperienceYears,
                f.Bio,
                f.Subjects,
                f.OfficeHours,
                f.ProfileImage,
                f.Rating,
                f.TotalStudents,
                f.CreatedAt
            })
            .ToListAsync();

        return Ok(directory);
    }

    /// <summary>
    /// Public/Student endpoint to view a single faculty profile and their courses
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFacultyById(string id)
    {
        var faculty = await _context.Faculty
            .Find(f => f.Id == id || f.UserId == id)
            .FirstOrDefaultAsync();

        if (faculty == null)
        {
            return NotFound(new { message = "Faculty member not found." });
        }

        var courses = await _context.Courses
            .Find(c => c.InstructorId == faculty.UserId || c.InstructorId == faculty.Id || c.InstructorName == faculty.Name)
            .ToListAsync();

        return Ok(new
        {
            faculty.Id,
            faculty.UserId,
            faculty.Name,
            faculty.Email,
            faculty.Department,
            faculty.Designation,
            faculty.ExperienceYears,
            faculty.Bio,
            faculty.Subjects,
            faculty.OfficeHours,
            faculty.ProfileImage,
            faculty.Rating,
            faculty.TotalStudents,
            faculty.CreatedAt,
            courses = courses.Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Category,
                c.Level,
                c.Thumbnail,
                c.Price
            })
        });
    }
}
