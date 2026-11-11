using AI_LMS.API.DTOs;

namespace AI_LMS.API.AI.Services;

public interface IGeminiService
{
    Task<ChatResultDto> GenerateChatReplyAsync(
        string? studentId,
        string message,
        string? courseId,
        string? chapterId,
        string? lessonId,
        string? previousInteractionId,
        List<ChatHistoryItemDto>? fallbackHistory = null);

    Task<RecommendationsResponseDto> GenerateRecommendationsAsync(string studentId);
}
