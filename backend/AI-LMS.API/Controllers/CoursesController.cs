using AI_LMS.API.Data;
using AI_LMS.API.DTOs;
using AI_LMS.API.Models;
using AI_LMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ProgressService _progressService;

    public CoursesController(MongoDbContext context, ProgressService progressService)
    {
        _context = context;
        _progressService = progressService;
    }

    /// <summary>
    /// Public endpoint to list all published courses, with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCourses([FromQuery] string? category, [FromQuery] string? search)
    {
        var filterBuilder = Builders<Course>.Filter;
        var filter = filterBuilder.Empty;

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            filter &= filterBuilder.Eq(c => c.Category, category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchRegex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            var titleFilter = filterBuilder.Regex(c => c.Title, searchRegex);
            var descFilter = filterBuilder.Regex(c => c.Description, searchRegex);
            var instructorFilter = filterBuilder.Regex(c => c.InstructorName, searchRegex);
            filter &= (titleFilter | descFilter | instructorFilter);
        }

        var courses = await _context.Courses.Find(filter).ToListAsync();
        return Ok(courses);
    }

    /// <summary>
    /// Public endpoint to get course by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || !MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            return NotFound(new { message = "Course not found." });
        }

        var course = await _context.Courses.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (course == null)
        {
            return NotFound(new { message = "Course not found." });
        }
        return Ok(course);
    }

    /// <summary>
    /// Instructor or Admin creates a new course
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Faculty,Instructor,Admin,faculty,instructor,admin")]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        if (string.IsNullOrWhiteSpace(course.Title))
        {
            return BadRequest(new { message = "Course title is required." });
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrWhiteSpace(course.InstructorId))
        {
            course.InstructorId = !string.IsNullOrWhiteSpace(userId) ? userId : "faculty_instructor";
        }

        if (string.IsNullOrWhiteSpace(course.InstructorName))
        {
            course.InstructorName = !string.IsNullOrWhiteSpace(userName) ? userName : "Faculty Instructor";
        }

        if (string.IsNullOrWhiteSpace(course.Thumbnail))
        {
            course.Thumbnail = "/images/courses/default-course.jpg";
        }

        if (course.Chapters != null && course.Chapters.Count > 0)
        {
            for (int i = 0; i < course.Chapters.Count; i++)
            {
                var ch = course.Chapters[i];
                if (string.IsNullOrWhiteSpace(ch.Id) || ch.Id.StartsWith("ch-"))
                {
                    ch.Id = Guid.NewGuid().ToString();
                }
                if (ch.Order <= 0) ch.Order = i + 1;

                if (ch.Lessons != null)
                {
                    for (int j = 0; j < ch.Lessons.Count; j++)
                    {
                        var les = ch.Lessons[j];
                        if (string.IsNullOrWhiteSpace(les.Id) || les.Id.StartsWith("les-"))
                        {
                            les.Id = Guid.NewGuid().ToString();
                        }
                        if (les.Order <= 0) les.Order = j + 1;

                        if (string.IsNullOrWhiteSpace(les.YoutubeVideoId) && !string.IsNullOrWhiteSpace(les.VideoUrl))
                        {
                            var match = System.Text.RegularExpressions.Regex.Match(les.VideoUrl, @"(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})");
                            if (match.Success)
                            {
                                les.YoutubeVideoId = match.Groups[1].Value;
                            }
                        }
                    }
                }
            }
        }

        if (course.Tags == null || course.Tags.Count == 0)
        {
            course.Tags = new List<string> { course.Category ?? "General", "Verified Syllabus" };
        }

        if (course.DurationHours <= 0)
        {
            course.DurationHours = 20;
        }

        course.CreatedAt = DateTime.UtcNow;
        await _context.Courses.InsertOneAsync(course);

        return CreatedAtAction(nameof(GetCourseById), new { id = course.Id }, course);
    }

    /// <summary>
    /// Update existing course
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Faculty,Instructor,Admin,faculty,instructor,admin")]
    public async Task<IActionResult> UpdateCourse(string id, [FromBody] Course updatedCourse)
    {
        if (string.IsNullOrWhiteSpace(id) || !MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            return NotFound(new { message = "Course not found." });
        }

        var existing = await _context.Courses.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (existing == null)
        {
            return NotFound(new { message = "Course not found." });
        }

        updatedCourse.Id = id;
        updatedCourse.InstructorId = existing.InstructorId;
        updatedCourse.CreatedAt = existing.CreatedAt;

        await _context.Courses.ReplaceOneAsync(c => c.Id == id, updatedCourse);
        return Ok(updatedCourse);
    }

    /// <summary>
    /// Delete course
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Faculty,Instructor,Admin,faculty,instructor,admin")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || !MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            return NotFound(new { message = "Course not found." });
        }

        var result = await _context.Courses.DeleteOneAsync(c => c.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Course not found." });
        }
        return Ok(new { message = "Course deleted successfully." });
    }

    /// <summary>
    /// Enroll the authenticated student into a course
    /// </summary>
    [HttpPost("{id}/enroll")]
    [Authorize]
    public async Task<IActionResult> EnrollInCourse(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Student";
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var enrollment = await _progressService.EnrollStudentAsync(userId, userName, userEmail, id);
            return Ok(enrollment);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get sequential progression state, completed lessons, and unlocked modules for a course
    /// </summary>
    [HttpGet("{id}/progress")]
    [Authorize]
    public async Task<IActionResult> GetCourseProgress(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var progress = await _progressService.GetCourseProgressAsync(userId, id);
            return Ok(progress);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get protected lesson details enforcing sequential unlock rules on the backend.
    /// Rejects unauthorized or locked lesson requests and scrubs media URLs.
    /// </summary>
    [HttpGet("{id}/lessons/{lessonId}")]
    [Authorize]
    public async Task<IActionResult> GetProtectedLesson(string id, string lessonId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var lesson = await _progressService.GetProtectedLessonAsync(userId, id, lessonId);
            if (lesson.IsLocked)
            {
                return StatusCode(StatusCodes.Status403Forbidden, lesson);
            }
            return Ok(lesson);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Record periodic video playback progress from YouTube Player API
    /// </summary>
    [HttpPost("{id}/lessons/{lessonId}/video-progress")]
    [Authorize]
    public async Task<IActionResult> UpdateVideoProgress(string id, string lessonId, [FromBody] VideoProgressUpdateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var result = await _progressService.UpdateVideoProgressAsync(userId, id, lessonId, dto);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not enrolled", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Mark a lesson as completed, unlocking the next sequential lesson or module
    /// </summary>
    [HttpPost("{id}/lessons/{lessonId}/complete")]
    [Authorize]
    public async Task<IActionResult> CompleteLesson(string id, string lessonId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var result = await _progressService.CompleteLessonAsync(userId, id, lessonId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not enrolled", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get list of courses enrolled by the authenticated student
    /// </summary>
    [HttpGet("enrolled")]
    [Authorize]
    public async Task<IActionResult> GetEnrolledCourses()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        var enrollments = await _context.Enrollments.Find(e => e.StudentId == userId).ToListAsync();
        var courseIds = enrollments.Select(e => e.CourseId).Where(id => !string.IsNullOrEmpty(id)).ToHashSet();

        var courses = await _context.Courses.Find(c => c.Id != null && courseIds.Contains(c.Id)).ToListAsync();

        var result = enrollments.Select(e =>
        {
            var c = courses.FirstOrDefault(crs => crs.Id == e.CourseId);
            return new
            {
                EnrollmentId = e.Id,
                CourseId = e.CourseId,
                Title = c?.Title ?? e.CourseTitle,
                Description = c?.Description ?? string.Empty,
                Category = c?.Category ?? string.Empty,
                Thumbnail = c?.Thumbnail ?? "/images/courses/default-course.jpg",
                ProgressPercent = e.ProgressPercent,
                Status = e.Status,
                EnrolledAt = e.EnrolledAt,
                CompletedAt = e.CompletedAt
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// Get all enrollments for Admin/Faculty dashboard
    /// </summary>
    [HttpGet("admin-enrollments")]
    [Authorize(Roles = "Faculty,Instructor,Admin")]
    public async Task<IActionResult> GetAdminEnrollments()
    {
        var enrollments = await _context.Enrollments.Find(_ => true).ToListAsync();
        return Ok(enrollments);
    }
}
