using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AI_LMS.API.Models;

[BsonIgnoreExtraElements]
public class Certificate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string CertificateNumber { get; set; } = string.Empty;

    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;

    public string CourseId { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;

    public string Title { get; set; } = "Certificate of Conceptual & Practical Mastery";
    public string Grade { get; set; } = "Distinction (100%)";
    public string Issuer { get; set; } = "Learnova AI Academic Council";
    public string InstructorName { get; set; } = string.Empty;

    public List<string> Skills { get; set; } = new();

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public bool NeedsReview { get; set; } = false;
}
