using AI_LMS.API.Data;
using AI_LMS.API.DTOs;
using AI_LMS.API.Models;
using AI_LMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly MongoDbContext _context;

    public AdminController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalUsers = await _context.Users.CountDocumentsAsync(_ => true);
        var totalStudents = await _context.Users.CountDocumentsAsync(u => u.Role == "Student");
        var totalFaculty = await _context.Users.CountDocumentsAsync(u => u.Role == "Faculty");
        var totalCourses = await _context.Courses.CountDocumentsAsync(_ => true);

        return Ok(new
        {
            message = "Welcome to Admin Dashboard!",
            stats = new
            {
                totalUsers,
                totalStudents,
                totalFaculty,
                totalCourses
            }
        });
    }

    [HttpPost("create-faculty")]
    public async Task<IActionResult> CreateFaculty(CreateFacultyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Name, email and password are required." });
        }

        if (!PasswordValidator.Validate(dto.Password, out var passwordErrors))
        {
            return BadRequest(new { message = passwordErrors[0], errors = passwordErrors });
        }

        var existingUser = await _context.Users
            .Find(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (existingUser != null)
        {
            return Conflict(new { message = "Email already registered." });
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Faculty",
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.InsertOneAsync(user);

        var facultyProfile = new Faculty
        {
            UserId = user.Id!,
            Name = user.Name,
            Email = user.Email,
            Department = dto.Department,
            Designation = dto.Designation,
            ExperienceYears = dto.ExperienceYears,
            Bio = dto.Bio,
            Subjects = dto.Subjects ?? new List<string>(),
            OfficeHours = dto.OfficeHours,
            ProfileImage = dto.ProfileImage,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Faculty.InsertOneAsync(facultyProfile);

        return Ok(new
        {
            message = "Faculty account and profile created successfully!",
            userId = user.Id,
            facultyId = facultyProfile.Id,
            email = user.Email,
            role = user.Role
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Find(_ => true)
            .Project(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("faculty")]
    public async Task<IActionResult> GetAllFaculty()
    {
        var facultyList = await _context.Faculty
            .Find(_ => true)
            .ToListAsync();

        return Ok(facultyList);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "User not found." });
        }

        // Also clean up faculty profile if exists
        await _context.Faculty.DeleteOneAsync(f => f.UserId == id);

        return Ok(new { message = "User deleted successfully." });
    }

    /// <summary>
    /// MongoDB Database Overview & Collection Stats for the Database UI
    /// </summary>
    [HttpGet("database/overview")]
    public async Task<IActionResult> GetDatabaseOverview()
    {
        var collectionsCursor = await _context.Database.ListCollectionNamesAsync();
        var collectionNames = await collectionsCursor.ToListAsync();

        var collectionsInfo = new List<object>();

        foreach (var colName in collectionNames)
        {
            var col = _context.Database.GetCollection<BsonDocument>(colName);
            var docCount = await col.CountDocumentsAsync(new BsonDocument());

            collectionsInfo.Add(new
            {
                name = colName,
                documentCount = docCount
            });
        }

        return Ok(new
        {
            database = _context.DatabaseName,
            status = "Connected",
            engine = _context.MaskedConnectionString.Contains("mongodb.net") ? "MongoDB Atlas (Cloud Cluster)" : "MongoDB v7.0 / v8.0",
            connectionUri = _context.MaskedConnectionString,
            totalCollections = collectionNames.Count,
            collections = collectionsInfo
        });
    }

    /// <summary>
    /// Retrieve documents from a specific MongoDB collection for live Database Explorer
    /// </summary>
    [HttpGet("database/collection/{collectionName}")]
    public async Task<IActionResult> GetCollectionDocuments(string collectionName, [FromQuery] int limit = 50)
    {
        if (string.IsNullOrWhiteSpace(collectionName))
        {
            return BadRequest(new { message = "Collection name is required." });
        }

        var col = _context.Database.GetCollection<BsonDocument>(collectionName);
        var docs = await col.Find(new BsonDocument())
                            .Limit(Math.Clamp(limit, 1, 100))
                            .ToListAsync();

        var jsonDocs = docs.Select(d => MongoDB.Bson.Serialization.BsonSerializer.Deserialize<object>(d.ToJson())).ToList();

        return Ok(new
        {
            collection = collectionName,
            count = docs.Count,
            documents = jsonDocs
        });
    }

    /// <summary>
    /// Insert a raw BSON/JSON document into a MongoDB collection
    /// </summary>
    [HttpPost("database/collection/{collectionName}/insert")]
    public async Task<IActionResult> InsertDocument(string collectionName, [FromBody] System.Text.Json.JsonElement jsonElement)
    {
        if (string.IsNullOrWhiteSpace(collectionName))
        {
            return BadRequest(new { message = "Collection name is required." });
        }

        try
        {
            var rawJson = jsonElement.GetRawText();
            var bsonDoc = BsonDocument.Parse(rawJson);
            if (!bsonDoc.Contains("_id"))
            {
                bsonDoc["_id"] = ObjectId.GenerateNewId();
            }

            var col = _context.Database.GetCollection<BsonDocument>(collectionName);
            await col.InsertOneAsync(bsonDoc);

            return Ok(new
            {
                message = "Document inserted successfully into MongoDB collection!",
                id = bsonDoc["_id"].ToString()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to insert document: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete a document from a MongoDB collection by ID
    /// </summary>
    [HttpDelete("database/collection/{collectionName}/{id}")]
    public async Task<IActionResult> DeleteDocument(string collectionName, string id)
    {
        if (string.IsNullOrWhiteSpace(collectionName) || string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { message = "Collection name and ID are required." });
        }

        try
        {
            var col = _context.Database.GetCollection<BsonDocument>(collectionName);
            FilterDefinition<BsonDocument> filter;

            if (ObjectId.TryParse(id, out var objectId))
            {
                filter = Builders<BsonDocument>.Filter.Eq("_id", objectId);
            }
            else
            {
                filter = Builders<BsonDocument>.Filter.Eq("_id", id);
            }

            var result = await col.DeleteOneAsync(filter);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Document with specified ID not found." });
            }

            return Ok(new { message = "Document deleted successfully from MongoDB collection." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to delete document: {ex.Message}" });
        }
    }

    /// <summary>
    /// Reseed MongoDB database with initial sample data
    /// </summary>
    [HttpPost("database/reseed")]
    public async Task<IActionResult> ReseedDatabase()
    {
        try
        {
            await DbSeeder.SeedDatabaseDirectAsync(_context);
            return Ok(new { message = "Learnova AI database re-seeded successfully with initial admin, faculty, student, AI agent, and courses!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error reseeding database: {ex.Message}" });
        }
    }
}