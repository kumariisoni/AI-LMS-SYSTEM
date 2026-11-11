using AI_LMS.API.Data;
using AI_LMS.API.DTOs;
using AI_LMS.API.Models;
using MongoDB.Driver;

namespace AI_LMS.API.Services;

public class ProgressService
{
    private readonly MongoDbContext _context;
    private readonly ILogger<ProgressService> _logger;

    public ProgressService(MongoDbContext context, ILogger<ProgressService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Enrolls a student in a course if not already enrolled.
    /// </summary>
    public async Task<Enrollment> EnrollStudentAsync(string studentId, string studentName, string studentEmail, string courseId)
    {
        var existingEnrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        if (existingEnrollment != null)
        {
            return existingEnrollment;
        }

        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        var enrollment = new Enrollment
        {
            StudentId = studentId,
            StudentName = studentName,
            StudentEmail = studentEmail,
            CourseId = courseId,
            CourseTitle = course.Title,
            ProgressPercent = 0,
            Status = "Active",
            EnrolledAt = DateTime.UtcNow
        };

        try
        {
            await _context.Enrollments.InsertOneAsync(enrollment);

            // Increment enrolled students on the course
            await _context.Courses.UpdateOneAsync(
                c => c.Id == courseId,
                Builders<Course>.Update.Inc(c => c.EnrolledStudents, 1)
            );

            return enrollment;
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            // Gracefully handle concurrent enrollment requests and return existing enrollment
            return await _context.Enrollments
                .Find(e => e.StudentId == studentId && e.CourseId == courseId)
                .FirstOrDefaultAsync() ?? enrollment;
        }
    }

    /// <summary>
    /// Gets detailed progress and unlocked status for all chapters and lessons of a course.
    /// </summary>
    public async Task<CourseProgressDto> GetCourseProgressAsync(string studentId, string courseId)
    {
        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        var enrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        var isEnrolled = enrollment != null;

        var progressRecords = await _context.StudentProgress
            .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.Completed)
            .ToListAsync();

        var completedLessonIds = progressRecords.Select(p => p.LessonId).ToHashSet();

        var unlockedLessonIds = new HashSet<string>();
        var unlockedChapterIds = new HashSet<string>();

        var sortedChapters = (course.Chapters ?? new List<Chapter>())
            .OrderBy(c => c.Order)
            .ToList();

        int totalLessons = 0;
        int completedLessonsCount = 0;

        string? firstUnlockedIncompleteLessonId = null;

        bool previousChapterCompleted = true; // First chapter is always unlocked for enrolled students

        for (int chIndex = 0; chIndex < sortedChapters.Count; chIndex++)
        {
            var chapter = sortedChapters[chIndex];
            var sortedLessons = (chapter.Lessons ?? new List<Lesson>())
                .OrderBy(l => l.Order)
                .ToList();

            totalLessons += sortedLessons.Count;

            // Module 1 is unlocked initially.
            // Module k (k > 1) is unlocked if all lessons in all previous modules are completed.
            bool isChapterUnlocked = isEnrolled && previousChapterCompleted;

            if (isChapterUnlocked)
            {
                unlockedChapterIds.Add(chapter.Id);
            }

            bool previousLessonCompleted = true; // First lesson in unlocked chapter is unlocked

            foreach (var lesson in sortedLessons)
            {
                bool isCompleted = completedLessonIds.Contains(lesson.Id);
                if (isCompleted)
                {
                    completedLessonsCount++;
                }

                // Lesson is unlocked if chapter is unlocked AND previous lesson in sequence is completed
                bool isLessonUnlocked = isChapterUnlocked && previousLessonCompleted;

                if (isLessonUnlocked)
                {
                    unlockedLessonIds.Add(lesson.Id);

                    if (!isCompleted && firstUnlockedIncompleteLessonId == null)
                    {
                        firstUnlockedIncompleteLessonId = lesson.Id;
                    }
                }

                // For the next lesson in this chapter to be unlocked, current lesson must be completed
                previousLessonCompleted = isCompleted;
            }

            // For the next chapter to be unlocked, all lessons in current chapter must be completed
            bool currentChapterAllDone = sortedLessons.Count > 0 && sortedLessons.All(l => completedLessonIds.Contains(l.Id));
            previousChapterCompleted = isChapterUnlocked && currentChapterAllDone;
        }

        int progressPercent = totalLessons > 0 ? (completedLessonsCount * 100) / totalLessons : 0;
        bool isCourseCompleted = totalLessons > 0 && completedLessonsCount == totalLessons;

        // Sync progress percentage back to enrollment if changed
        if (enrollment != null && (enrollment.ProgressPercent != progressPercent || (isCourseCompleted && enrollment.Status != "Completed")))
        {
            enrollment.ProgressPercent = progressPercent;
            if (isCourseCompleted)
            {
                enrollment.Status = "Completed";
                enrollment.CompletedAt ??= DateTime.UtcNow;
            }
            else if (progressPercent >= 80)
            {
                enrollment.Status = "Near Completion";
            }

            await _context.Enrollments.ReplaceOneAsync(e => e.Id == enrollment.Id, enrollment);
        }

        return new CourseProgressDto
        {
            CourseId = courseId,
            CourseTitle = course.Title,
            IsEnrolled = isEnrolled,
            ProgressPercent = progressPercent,
            CompletedLessonsCount = completedLessonsCount,
            TotalLessonsCount = totalLessons,
            CompletedLessonIds = completedLessonIds.ToList(),
            UnlockedLessonIds = unlockedLessonIds.ToList(),
            UnlockedChapterIds = unlockedChapterIds.ToList(),
            CurrentLessonId = firstUnlockedIncompleteLessonId ?? unlockedLessonIds.LastOrDefault(),
            IsCompleted = isCourseCompleted,
            EnrolledAt = enrollment?.EnrolledAt,
            CompletedAt = enrollment?.CompletedAt
        };
    }

    /// <summary>
    /// Gets protected lesson details enforcing sequential unlock rules on the backend,
    /// and returning the student's playback metrics and resume timestamp.
    /// </summary>
    public async Task<ProtectedLessonDto> GetProtectedLessonAsync(string studentId, string courseId, string lessonId)
    {
        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        Lesson? targetLesson = null;
        Chapter? targetChapter = null;

        foreach (var ch in course.Chapters ?? new List<Chapter>())
        {
            var l = ch.Lessons?.FirstOrDefault(les => les.Id == lessonId);
            if (l != null)
            {
                targetLesson = l;
                targetChapter = ch;
                break;
            }
        }

        if (targetLesson == null || targetChapter == null)
        {
            throw new ArgumentException("Lesson not found in course");
        }

        // Check enrollment
        var enrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        if (enrollment == null)
        {
            return new ProtectedLessonDto
            {
                Id = targetLesson.Id,
                Title = targetLesson.Title,
                Description = targetLesson.Description,
                Duration = targetLesson.Duration,
                Author = targetLesson.Author,
                Order = targetLesson.Order,
                IsLocked = true,
                LockReason = "You must enroll in this course to access lessons.",
                VideoUrl = null,
                YoutubeVideoId = null,
                Completed = false
            };
        }

        var progress = await GetCourseProgressAsync(studentId, courseId);
        bool isUnlocked = progress.UnlockedLessonIds.Contains(lessonId);
        bool isCompleted = progress.CompletedLessonIds.Contains(lessonId);

        // Fetch stored playback details
        var playbackRecord = await _context.StudentProgress
            .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.LessonId == lessonId)
            .FirstOrDefaultAsync();

        if (!isUnlocked)
        {
            return new ProtectedLessonDto
            {
                Id = targetLesson.Id,
                Title = targetLesson.Title,
                Description = targetLesson.Description,
                Duration = targetLesson.Duration,
                Author = targetLesson.Author,
                Order = targetLesson.Order,
                IsLocked = true,
                LockReason = "Complete the previous lesson to unlock this lesson.",
                VideoUrl = null,
                YoutubeVideoId = null,
                Completed = isCompleted,
                WatchedSeconds = playbackRecord?.WatchedSeconds ?? 0,
                VideoDuration = playbackRecord?.VideoDuration ?? 0,
                WatchedPercentage = playbackRecord?.WatchedPercentage ?? 0,
                LastPositionSeconds = playbackRecord?.LastPositionSeconds ?? 0,
                VideoRequirementCompleted = playbackRecord?.VideoRequirementCompleted ?? false
            };
        }

        return new ProtectedLessonDto
        {
            Id = targetLesson.Id,
            Title = targetLesson.Title,
            Description = targetLesson.Description,
            Duration = targetLesson.Duration,
            Author = targetLesson.Author,
            Order = targetLesson.Order,
            IsLocked = false,
            LockReason = string.Empty,
            VideoUrl = targetLesson.VideoUrl,
            YoutubeVideoId = targetLesson.YoutubeVideoId,
            Completed = isCompleted,
            WatchedSeconds = playbackRecord?.WatchedSeconds ?? 0,
            VideoDuration = playbackRecord?.VideoDuration ?? 0,
            WatchedPercentage = playbackRecord?.WatchedPercentage ?? 0,
            LastPositionSeconds = playbackRecord?.LastPositionSeconds ?? 0,
            VideoRequirementCompleted = playbackRecord?.VideoRequirementCompleted ?? isCompleted
        };
    }

    /// <summary>
    /// Periodic progress heartbeat from YouTube Player API.
    /// Updates verified watched time, seek position, and requirement completion.
    /// </summary>
    public async Task<VideoProgressResponseDto> UpdateVideoProgressAsync(
        string studentId,
        string courseId,
        string lessonId,
        VideoProgressUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        var enrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        if (enrollment == null)
        {
            throw new InvalidOperationException("Student is not enrolled in this course");
        }

        var currentProgress = await GetCourseProgressAsync(studentId, courseId);
        if (!currentProgress.UnlockedLessonIds.Contains(lessonId))
        {
            throw new InvalidOperationException("Cannot record progress for a locked lesson.");
        }

        // Find chapter
        string chapterId = string.Empty;
        foreach (var ch in course.Chapters ?? new List<Chapter>())
        {
            if (ch.Lessons.Any(l => l.Id == lessonId))
            {
                chapterId = ch.Id;
                break;
            }
        }

        var record = await _context.StudentProgress
            .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.LessonId == lessonId)
            .FirstOrDefaultAsync();

        if (record == null)
        {
            record = new StudentProgress
            {
                StudentId = studentId,
                CourseId = courseId,
                ChapterId = chapterId,
                LessonId = lessonId,
                Completed = false,
                WatchedSeconds = dto.WatchedSeconds,
                VideoDuration = dto.VideoDuration,
                WatchedPercentage = dto.WatchedPercentage,
                LastPositionSeconds = dto.LastPositionSeconds,
                VideoRequirementCompleted = dto.WatchedPercentage >= 90,
                LastActiveAt = DateTime.UtcNow
            };

            try
            {
                await _context.StudentProgress.InsertOneAsync(record);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                record = await _context.StudentProgress
                    .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.LessonId == lessonId)
                    .FirstOrDefaultAsync();
            }
        }
        if (record != null && record.Id != null)
        {
            // Update metrics monotonically
            record.WatchedSeconds = Math.Max(record.WatchedSeconds, dto.WatchedSeconds);
            if (dto.VideoDuration > 0)
            {
                record.VideoDuration = dto.VideoDuration;
            }
            record.WatchedPercentage = Math.Max(record.WatchedPercentage, dto.WatchedPercentage);
            if (dto.LastPositionSeconds > 0)
            {
                record.LastPositionSeconds = dto.LastPositionSeconds;
            }
            if (record.WatchedPercentage >= 90 || (record.VideoDuration > 0 && record.WatchedSeconds >= record.VideoDuration * 0.9))
            {
                record.VideoRequirementCompleted = true;
            }
            record.LastActiveAt = DateTime.UtcNow;

            await _context.StudentProgress.ReplaceOneAsync(p => p.Id == record.Id, record);
        }

        return new VideoProgressResponseDto
        {
            Success = true,
            Message = "Video playback progress recorded.",
            WatchedSeconds = record?.WatchedSeconds ?? 0,
            VideoDuration = record?.VideoDuration ?? 0,
            WatchedPercentage = record?.WatchedPercentage ?? 0,
            VideoRequirementCompleted = record?.VideoRequirementCompleted ?? false,
            LastPositionSeconds = record?.LastPositionSeconds ?? 0
        };
    }

    /// <summary>
    /// Explicitly completes a lesson, verifies unlock integrity AND verifies that the
    /// student has actually watched at least 90% of the video according to server-side tracking.
    /// </summary>
    public async Task<CompleteLessonResponseDto> CompleteLessonAsync(string studentId, string courseId, string lessonId)
    {
        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        var enrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        if (enrollment == null)
        {
            throw new InvalidOperationException("Student is not enrolled in this course");
        }

        var currentProgress = await GetCourseProgressAsync(studentId, courseId);
        if (!currentProgress.UnlockedLessonIds.Contains(lessonId))
        {
            throw new InvalidOperationException("Cannot complete a locked lesson. Sequential progression required.");
        }

        // Fetch stored progress to verify real video watch requirement
        var existingProgress = await _context.StudentProgress
            .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.LessonId == lessonId)
            .FirstOrDefaultAsync();

        bool isRequirementMet = existingProgress != null && (
            existingProgress.Completed ||
            existingProgress.VideoRequirementCompleted ||
            existingProgress.WatchedPercentage >= 90 ||
            (existingProgress.VideoDuration > 0 && existingProgress.WatchedSeconds >= existingProgress.VideoDuration * 0.9)
        );

        if (!isRequirementMet)
        {
            var currentPct = existingProgress?.WatchedPercentage ?? 0;
            throw new InvalidOperationException($"Video watch requirement not met. You must watch at least 90% of the lesson video to complete this lesson. Current watched progress: {currentPct}%.");
        }

        // Find chapter for this lesson
        string chapterId = string.Empty;
        foreach (var ch in course.Chapters ?? new List<Chapter>())
        {
            if (ch.Lessons.Any(l => l.Id == lessonId))
            {
                chapterId = ch.Id;
                break;
            }
        }

        if (existingProgress == null)
        {
            existingProgress = new StudentProgress
            {
                StudentId = studentId,
                CourseId = courseId,
                ChapterId = chapterId,
                LessonId = lessonId,
                Completed = true,
                CompletedAt = DateTime.UtcNow,
                VideoRequirementCompleted = true,
                LastActiveAt = DateTime.UtcNow
            };

            try
            {
                await _context.StudentProgress.InsertOneAsync(existingProgress);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                existingProgress = await _context.StudentProgress
                    .Find(p => p.StudentId == studentId && p.CourseId == courseId && p.LessonId == lessonId)
                    .FirstOrDefaultAsync();
                if (existingProgress != null)
                {
                    existingProgress.Completed = true;
                    existingProgress.CompletedAt = DateTime.UtcNow;
                    existingProgress.VideoRequirementCompleted = true;
                    await _context.StudentProgress.ReplaceOneAsync(p => p.Id == existingProgress.Id, existingProgress);
                }
            }
        }
        else
        {
            existingProgress.Completed = true;
            existingProgress.CompletedAt = DateTime.UtcNow;
            existingProgress.VideoRequirementCompleted = true;
            await _context.StudentProgress.ReplaceOneAsync(p => p.Id == existingProgress.Id, existingProgress);
        }

        // Recompute updated progress
        var updatedProgress = await GetCourseProgressAsync(studentId, courseId);

        // Find the sequential next lesson
        string? nextLessonId = null;
        string? nextChapterId = null;

        var allOrderedLessons = (course.Chapters ?? new List<Chapter>())
            .OrderBy(c => c.Order)
            .SelectMany(c => (c.Lessons ?? new List<Lesson>()).OrderBy(l => l.Order).Select(l => new { ChapterId = c.Id, Lesson = l }))
            .ToList();

        var currentIndex = allOrderedLessons.FindIndex(x => x.Lesson.Id == lessonId);
        if (currentIndex >= 0 && currentIndex + 1 < allOrderedLessons.Count)
        {
            var next = allOrderedLessons[currentIndex + 1];
            nextLessonId = next.Lesson.Id;
            nextChapterId = next.ChapterId;
        }

        if (updatedProgress.IsCompleted)
        {
            try
            {
                await GenerateOrGetCertificateAsync(studentId, courseId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Automatic certificate issuance deferred for student {StudentId} on course {CourseId}", studentId, courseId);
            }
        }

        return new CompleteLessonResponseDto
        {
            Success = true,
            Message = "Lesson marked as completed successfully.",
            LessonId = lessonId,
            NextLessonId = nextLessonId,
            NextChapterId = nextChapterId,
            ProgressPercent = updatedProgress.ProgressPercent,
            CourseCompleted = updatedProgress.IsCompleted
        };
    }

    /// <summary>
    /// Generates or retrieves an existing verified certificate for an enrolled student who has completed 100% of the course.
    /// Strictly enforces completion requirements and prevents unauthorized generation.
    /// </summary>
    public async Task<Certificate> GenerateOrGetCertificateAsync(string studentId, string courseId)
    {
        if (string.IsNullOrWhiteSpace(courseId) || !MongoDB.Bson.ObjectId.TryParse(courseId, out _))
        {
            throw new ArgumentException("Course not found");
        }

        var course = await _context.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        if (course == null)
        {
            throw new ArgumentException("Course not found");
        }

        var enrollment = await _context.Enrollments
            .Find(e => e.StudentId == studentId && e.CourseId == courseId)
            .FirstOrDefaultAsync();

        if (enrollment == null)
        {
            throw new InvalidOperationException("Student is not enrolled in this course.");
        }

        // Verify completion requirements
        var progress = await GetCourseProgressAsync(studentId, courseId);
        if (!progress.IsCompleted)
        {
            throw new InvalidOperationException($"Course requirements not completed. Current progress: {progress.ProgressPercent}%. All lessons must be completed to earn a certificate.");
        }

        // Check if certificate already exists (idempotent, prevent duplicate certificate issuance)
        var existingCert = await _context.Certificates
            .Find(c => c.StudentId == studentId && c.CourseId == courseId && !c.NeedsReview)
            .FirstOrDefaultAsync();

        if (existingCert != null)
        {
            return existingCert;
        }

        // Retrieve student user info
        var studentUser = await _context.Users.Find(u => u.Id == studentId).FirstOrDefaultAsync();
        string studentName = !string.IsNullOrWhiteSpace(studentUser?.Name) ? studentUser.Name : (!string.IsNullOrWhiteSpace(enrollment.StudentName) ? enrollment.StudentName : "Student");
        string studentEmail = !string.IsNullOrWhiteSpace(studentUser?.Email) ? studentUser.Email : enrollment.StudentEmail;

        // Generate clean unique certificate number
        string certNum = $"LEARNOVA-{DateTime.UtcNow.Year}-{Random.Shared.Next(1000, 9999):D4}";
        while (await _context.Certificates.Find(c => c.CertificateNumber == certNum).AnyAsync())
        {
            certNum = $"LEARNOVA-{DateTime.UtcNow.Year}-{Random.Shared.Next(1000, 9999):D4}";
        }

        // Extract skills from course chapters or category
        var skills = new List<string>();
        if (!string.IsNullOrWhiteSpace(course.Category))
        {
            skills.Add(course.Category);
        }
        if (course.Chapters != null)
        {
            foreach (var ch in course.Chapters.Take(4))
            {
                if (!string.IsNullOrWhiteSpace(ch.Title) && !skills.Contains(ch.Title))
                {
                    skills.Add(ch.Title);
                }
            }
        }
        if (skills.Count == 0)
        {
            skills.Add("Comprehensive Curriculum");
            skills.Add("Practical Competency");
        }

        var certificate = new Certificate
        {
            CertificateNumber = certNum,
            StudentId = studentId,
            StudentName = studentName,
            StudentEmail = studentEmail,
            CourseId = courseId,
            CourseTitle = course.Title,
            Title = "Certificate of Conceptual & Practical Mastery",
            Grade = "Distinction (100%)",
            Issuer = "Learnova AI Academic Council",
            InstructorName = string.IsNullOrWhiteSpace(course.InstructorName) ? "Learnova AI Academic Faculty" : course.InstructorName,
            Skills = skills,
            IssuedAt = enrollment.CompletedAt ?? DateTime.UtcNow,
            NeedsReview = false
        };

        await _context.Certificates.InsertOneAsync(certificate);
        return certificate;
    }
}
