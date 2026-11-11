using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AI_LMS.API.Models;

[BsonIgnoreExtraElements]
public class Faculty
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public string Bio { get; set; } = string.Empty;

    public List<string> Subjects { get; set; } = new();

    public string OfficeHours { get; set; } = string.Empty;

    public string ProfileImage { get; set; } = string.Empty;

    public double Rating { get; set; } = 4.9;

    public int TotalStudents { get; set; } = 4500;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
