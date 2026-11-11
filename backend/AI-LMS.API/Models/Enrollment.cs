using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AI_LMS.API.Models;

[BsonIgnoreExtraElements]
public class Enrollment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;

    public string CourseId { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;

    public int ProgressPercent { get; set; } = 0;
    public string Status { get; set; } = "Active"; // "Active", "Near Completion", "Completed"
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
