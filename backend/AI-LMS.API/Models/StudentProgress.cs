using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AI_LMS.API.Models;

[BsonIgnoreExtraElements]
public class StudentProgress
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string StudentId { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string ChapterId { get; set; } = string.Empty;
    public string LessonId { get; set; } = string.Empty;

    public bool Completed { get; set; } = false;
    public DateTime? CompletedAt { get; set; }

    // Playback verification metrics
    public double WatchedSeconds { get; set; } = 0;
    public double VideoDuration { get; set; } = 0;
    public int WatchedPercentage { get; set; } = 0;
    public double LastPositionSeconds { get; set; } = 0;
    public bool VideoRequirementCompleted { get; set; } = false;
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;
}
