using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace AI_LMS.API.Models;

[BsonIgnoreExtraElements]
public class Course
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Level { get; set; } = "Beginner";

    public string? InstructorId { get; set; } = string.Empty;

    public string? InstructorName { get; set; } = string.Empty;

    public string Thumbnail { get; set; } = string.Empty;

    [BsonIgnore]
    [JsonPropertyName("thumbnailUrl")]
    public string? ThumbnailUrl
    {
        get => Thumbnail;
        set
        {
            if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Thumbnail))
            {
                Thumbnail = value;
            }
        }
    }

    public decimal Price { get; set; }

    public decimal OriginalPrice { get; set; }

    public int DurationHours { get; set; } = 30;

    public double Rating { get; set; } = 4.8;

    public int EnrolledStudents { get; set; } = 1200;

    public bool IsPublished { get; set; } = true;

    public List<string> Tags { get; set; } = new();

    public List<Chapter> Chapters { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[BsonIgnoreExtraElements]
public class Chapter
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; } = 1;
    public string Duration { get; set; } = "1.5 hrs";
    public List<Lesson> Lessons { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class Lesson
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string YoutubeVideoId { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Duration { get; set; } = "20 min";
    public int Order { get; set; } = 1;
    public bool IsPreview { get; set; } = false;
    public string Content { get; set; } = string.Empty;
}