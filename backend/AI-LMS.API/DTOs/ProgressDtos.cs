namespace AI_LMS.API.DTOs;

public class CourseProgressDto
{
    public string CourseId { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public bool IsEnrolled { get; set; }
    public int ProgressPercent { get; set; }
    public int CompletedLessonsCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public List<string> CompletedLessonIds { get; set; } = new();
    public List<string> UnlockedLessonIds { get; set; } = new();
    public List<string> UnlockedChapterIds { get; set; } = new();
    public string? CurrentLessonId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? EnrolledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CompleteLessonResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string LessonId { get; set; } = string.Empty;
    public string? NextLessonId { get; set; }
    public string? NextChapterId { get; set; }
    public int ProgressPercent { get; set; }
    public bool CourseCompleted { get; set; }
}

public class ProtectedLessonDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsLocked { get; set; }
    public string LockReason { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? YoutubeVideoId { get; set; }
    public bool Completed { get; set; }

    // Playback verification metrics
    public double WatchedSeconds { get; set; }
    public double VideoDuration { get; set; }
    public int WatchedPercentage { get; set; }
    public double LastPositionSeconds { get; set; }
    public bool VideoRequirementCompleted { get; set; }
}

public class VideoProgressUpdateDto
{
    public double WatchedSeconds { get; set; }
    public double VideoDuration { get; set; }
    public int WatchedPercentage { get; set; }
    public double LastPositionSeconds { get; set; }
}

public class VideoProgressResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public double WatchedSeconds { get; set; }
    public double VideoDuration { get; set; }
    public int WatchedPercentage { get; set; }
    public bool VideoRequirementCompleted { get; set; }
    public double LastPositionSeconds { get; set; }
}
