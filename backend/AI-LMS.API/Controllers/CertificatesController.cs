using AI_LMS.API.Data;
using AI_LMS.API.Models;
using AI_LMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ProgressService _progressService;

    public CertificatesController(MongoDbContext context, ProgressService progressService)
    {
        _context = context;
        _progressService = progressService;
    }

    /// <summary>
    /// Retrieves certificates belonging strictly to the currently authenticated student.
    /// Identity is derived exclusively from validated JWT claims.
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyCertificates()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        var certificates = await _context.Certificates
            .Find(c => c.StudentId == userId && !c.NeedsReview)
            .SortByDescending(c => c.IssuedAt)
            .ToListAsync();

        return Ok(certificates);
    }

    /// <summary>
    /// Explicitly claims an earned certificate after completing 100% of the course modules.
    /// Server-side validation guarantees the student has actually completed all lessons.
    /// </summary>
    [HttpPost("claim/{courseId}")]
    [Authorize]
    public async Task<IActionResult> ClaimCertificate(string courseId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        try
        {
            var certificate = await _progressService.GenerateOrGetCertificateAsync(userId, courseId);
            return Ok(certificate);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Retrieves a single certificate by MongoDB ID or Certificate Number.
    /// Enforces strict ownership: a student may only access their own certificate.
    /// Admins may view any certificate for administrative oversight.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetCertificateById(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new { message = "User identification required." });
        }

        Certificate? cert;
        if (MongoDB.Bson.ObjectId.TryParse(id, out _))
        {
            cert = await _context.Certificates
                .Find(c => c.Id == id || c.CertificateNumber == id)
                .FirstOrDefaultAsync();
        }
        else
        {
            cert = await _context.Certificates
                .Find(c => c.CertificateNumber == id)
                .FirstOrDefaultAsync();
        }

        if (cert == null)
        {
            return NotFound(new { message = "Certificate not found." });
        }

        // Ownership enforcement: Admin can view all; Student can ONLY view their own certificate
        if (role != "Admin" && cert.StudentId != userId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Access denied. You do not own this certificate."
            });
        }

        return Ok(cert);
    }

    /// <summary>
    /// Public verification endpoint: validates cryptographic/official certificate authenticity
    /// by unique CertificateNumber without leaking unrelated private student credentials.
    /// </summary>
    [HttpGet("verify/{certificateNumber}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyCertificate(string certificateNumber)
    {
        if (string.IsNullOrWhiteSpace(certificateNumber))
        {
            return BadRequest(new { verified = false, message = "Certificate number is required." });
        }

        Certificate? cert;
        if (MongoDB.Bson.ObjectId.TryParse(certificateNumber, out _))
        {
            cert = await _context.Certificates
                .Find(c => c.CertificateNumber == certificateNumber || c.Id == certificateNumber)
                .FirstOrDefaultAsync();
        }
        else
        {
            cert = await _context.Certificates
                .Find(c => c.CertificateNumber == certificateNumber)
                .FirstOrDefaultAsync();
        }

        if (cert == null || cert.NeedsReview)
        {
            return NotFound(new
            {
                verified = false,
                message = "Certificate record could not be found or is pending academic review."
            });
        }

        // Return sanitized public credential details
        return Ok(new
        {
            verified = true,
            certificateNumber = cert.CertificateNumber,
            studentName = cert.StudentName,
            courseTitle = cert.CourseTitle,
            title = cert.Title,
            grade = cert.Grade,
            issuer = cert.Issuer,
            instructorName = cert.InstructorName,
            skills = cert.Skills,
            issuedAt = cert.IssuedAt
        });
    }

    /// <summary>
    /// Administrative endpoint: view all issued certificates across the academy.
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllCertificatesForAdmin()
    {
        var certificates = await _context.Certificates
            .Find(_ => true)
            .SortByDescending(c => c.IssuedAt)
            .ToListAsync();

        return Ok(certificates);
    }
}
