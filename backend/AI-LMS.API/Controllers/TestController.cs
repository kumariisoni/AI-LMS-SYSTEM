using AI_LMS.API.Data;
using AI_LMS.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly MongoDbContext _context;

    public TestController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("mongodb")]
    public async Task<IActionResult> TestMongoDB()
    {
        var user = new User
        {
            Name = "Test Student",
            Email = "test@student.com",
            PasswordHash = "test123",
            Role = "Student"
        };

        await _context.Users.InsertOneAsync(user);

        return Ok(new
        {
            message = "MongoDB connection successful!",
            userId = user.Id
        });
    }
}