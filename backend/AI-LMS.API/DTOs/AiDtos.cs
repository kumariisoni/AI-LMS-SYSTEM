namespace AI_LMS.API.DTOs;

public class ChatHistoryItemDto
{
    public string Role { get; set; } = "user"; // "user" or "model"
    public string Text { get; set; } = string.Empty;
}

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public string? CourseId { get; set; }
    public string? ChapterId { get; set; }
    public string? LessonId { get; set; }
    public string? PreviousInteractionId { get; set; }
    public List<ChatHistoryItemDto>? History { get; set; }
    public List<ChatHistoryItemDto>? Conversation { get; set; }
    public List<ChatHistoryItemDto> GetHistory() => Conversation ?? History ?? new();
}

public class ChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public string? PreviousInteractionId { get; set; }
    public string? InteractionId { get; set; }
    public string Sender { get; set; } = "Learnova AI Tutor";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ChatResultDto
{
    public string Reply { get; set; } = string.Empty;
    public string? InteractionId { get; set; }
    public string? PreviousInteractionId { get; set; }
    public string Sender { get; set; } = "Learnova AI Tutor";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class RecommendationItemDto
{
    public string Type { get; set; } = "Recommended Course";
    public string Title { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Duration { get; set; } = "20 min";
    public string? CourseId { get; set; }
    public string? LessonId { get; set; }
    public string? Link { get; set; }
    public string Variant { get; set; } = "indigo";
}

public class RecommendationsResponseDto
{
    public bool HasData { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public List<RecommendationItemDto> Recommendations { get; set; } = new();
}

public class QuizGenRequest
{
    public string? Topic { get; set; }
    public int QuestionCount { get; set; } = 3;
}

public class StudyPlanRequest
{
    public string? Goal { get; set; }
    public int HoursPerWeek { get; set; } = 10;
}
