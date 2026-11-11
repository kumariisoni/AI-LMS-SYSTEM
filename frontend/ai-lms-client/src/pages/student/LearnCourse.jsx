import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  BookOpen,
  Check,
  Video,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import api from "../../services/api";
import coursesSeedData from "../../data/courses_seed.json";
import {
  Button,
  Card,
  Badge,
  ProgressBar
} from "../../components/common/UIPrimitives";

export default function LearnCourse() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLessonLocked, setIsLessonLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [completionError, setCompletionError] = useState("");

  const [progressData, setProgressData] = useState({
    isEnrolled: false,
    progressPercent: 0,
    completedLessonsCount: 0,
    totalLessonsCount: 0,
    completedLessonIds: [],
    unlockedLessonIds: [],
    unlockedChapterIds: [],
    currentLessonId: null,
    isCompleted: false
  });

  // Video watch metrics state
  const [videoProgress, setVideoProgress] = useState({
    watchedSeconds: 0,
    duration: 0,
    percentage: 0,
    requirementMet: false,
    lastPositionSeconds: 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isYTReady, setIsYTReady] = useState(false);

  // References for playback tracking & anti-cheat
  const playerRef = useRef(null);
  const trackerIntervalRef = useRef(null);
  const lastRecordedTimeRef = useRef(null);
  const watchedSecondsSetRef = useRef(new Set());
  const heartbeatTickRef = useRef(0);
  const activeVideoIdRef = useRef("");

  // Helper to extract YouTube video ID from lesson properties or url
  const getYoutubeId = useCallback((lesson) => {
    if (!lesson) return "";
    if (lesson.youtubeVideoId && lesson.youtubeVideoId.length === 11) {
      return lesson.youtubeVideoId;
    }
    if (lesson.videoUrl) {
      const match = lesson.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) return match[1];
    }
    return "";
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 1. Load YouTube IFrame Player API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsYTReady(true);
      return;
    }

    if (!document.getElementById("youtube-iframe-api-script")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      setIsYTReady(true);
    };
  }, []);

  // 2. Periodic backend sync of video progress
  const sendVideoProgressHeartbeat = useCallback(async (watchedSec, dur, pct, lastPos) => {
    if (!course?.id || !currentLesson?.id) return;
    try {
      await api.post(`/courses/${course.id}/lessons/${currentLesson.id}/video-progress`, {
        watchedSeconds: watchedSec,
        videoDuration: dur,
        watchedPercentage: pct,
        lastPositionSeconds: lastPos
      });
    } catch (err) {
      console.warn("Progress sync heartbeat:", err?.message);
    }
  }, [course?.id, currentLesson?.id]);

  // 3. Stop playback tracking interval
  const stopTrackingInterval = useCallback(() => {
    if (trackerIntervalRef.current) {
      clearInterval(trackerIntervalRef.current);
      trackerIntervalRef.current = null;
    }
  }, []);

  // 4. Start playback tracking interval with anti-seeking and tab visibility validation
  const startTrackingInterval = useCallback(() => {
    stopTrackingInterval();

    trackerIntervalRef.current = setInterval(() => {
      // Tab hidden check: do not count watch time if tab is not active
      if (document.hidden) return;

      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== "function" || typeof player.getDuration !== "function") {
        return;
      }

      const curTime = player.getCurrentTime();
      const dur = player.getDuration();

      if (!dur || dur <= 0) return;

      // Seek jump detection: if current time jumped more than 3 seconds ahead of last recorded tick,
      // it's a scrub/seek. Do NOT count the skipped interval!
      const lastTime = lastRecordedTimeRef.current;
      if (lastTime !== null && (curTime - lastTime > 3 || lastTime - curTime > 3)) {
        lastRecordedTimeRef.current = curTime;
        return;
      }

      lastRecordedTimeRef.current = curTime;

      // Record this continuous second as genuinely watched
      const secIndex = Math.floor(curTime);
      watchedSecondsSetRef.current.add(secIndex);

      const uniqueWatchedCount = watchedSecondsSetRef.current.size;
      const calculatedPercentage = Math.min(100, Math.round((uniqueWatchedCount / dur) * 100));
      const requirementMet = calculatedPercentage >= 90;

      setVideoProgress((prev) => ({
        ...prev,
        watchedSeconds: uniqueWatchedCount,
        duration: Math.round(dur),
        percentage: calculatedPercentage,
        requirementMet: requirementMet || prev.requirementMet,
        lastPositionSeconds: curTime
      }));

      // Send periodic heartbeat every 10 ticks (approx every 10 seconds)
      heartbeatTickRef.current += 1;
      if (heartbeatTickRef.current >= 10 || requirementMet) {
        heartbeatTickRef.current = 0;
        sendVideoProgressHeartbeat(uniqueWatchedCount, dur, calculatedPercentage, curTime);
      }
    }, 1000);
  }, [sendVideoProgressHeartbeat, stopTrackingInterval]);

  // Clean up timer and tab visibility listener on unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTrackingInterval();
      } else if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
        if (playerRef.current.getPlayerState() === 1) { // PLAYING
          startTrackingInterval();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopTrackingInterval();
    };
  }, [startTrackingInterval, stopTrackingInterval]);

  // 5. Initialize or re-create YouTube Player when video changes
  useEffect(() => {
    const activeVideoId = !isLessonLocked ? getYoutubeId(currentLesson) : "";
    activeVideoIdRef.current = activeVideoId;

    if (!isPlaying || !isYTReady || !activeVideoId) {
      return;
    }

    // Reset tracking refs for the current lesson video
    watchedSecondsSetRef.current = new Set();
    lastRecordedTimeRef.current = null;
    heartbeatTickRef.current = 0;

    // Seed previously watched seconds if available
    if (videoProgress.watchedSeconds > 0) {
      for (let s = 0; s < Math.min(videoProgress.watchedSeconds, videoProgress.duration); s++) {
        watchedSecondsSetRef.current.add(s);
      }
    }

    const container = document.getElementById("yt-player-target");
    if (!container) return;

    // Clean up old player if exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    try {
      playerRef.current = new window.YT.Player("yt-player-target", {
        videoId: activeVideoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            const dur = event.target.getDuration();
            if (dur > 0) {
              setVideoProgress((prev) => ({
                ...prev,
                duration: Math.round(dur)
              }));
            }
            // Resume from last position if practical (> 5s and < dur - 5s)
            if (videoProgress.lastPositionSeconds > 5 && dur > 10 && videoProgress.lastPositionSeconds < dur - 5) {
              event.target.seekTo(videoProgress.lastPositionSeconds, true);
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState: PLAYING (1), PAUSED (2), ENDED (0), BUFFERING (3)
            if (event.data === 1) {
              startTrackingInterval();
            } else if (event.data === 2 || event.data === 3) {
              stopTrackingInterval();
            } else if (event.data === 0) {
              // Video finished playing
              stopTrackingInterval();
              const dur = event.target.getDuration();
              const uniqueWatched = watchedSecondsSetRef.current.size;
              const pct = Math.min(100, Math.round((uniqueWatched / dur) * 100));

              if (pct >= 90) {
                setVideoProgress((prev) => ({
                  ...prev,
                  percentage: 100,
                  requirementMet: true
                }));
                sendVideoProgressHeartbeat(dur, dur, 100, dur);
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn("YouTube Player initialization error:", err);
    }

    return () => {
      stopTrackingInterval();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [isPlaying, isYTReady, currentLesson?.id, isLessonLocked, getYoutubeId]);

  // Fetch course details & progress from backend
  const loadCourseAndProgress = useCallback(async () => {
    try {
      setLoading(true);
      let foundCourse = null;

      try {
        const res = await api.get(`/Courses/${id}`);
        if (res.data && res.data.title) {
          foundCourse = res.data;
        }
      } catch {
        try {
          const listRes = await api.get("/Courses");
          if (Array.isArray(listRes.data)) {
            foundCourse = listRes.data.find((c) => String(c.id || c._id) === String(id)) || null;
          }
        } catch {
          // ignore
        }
      }

      if (!foundCourse) {
        const seedMatch = (coursesSeedData || []).find(
          (c, i) =>
            String(c.id) === String(id) ||
            String(i + 1) === String(id) ||
            c.title.toLowerCase().includes(String(id).toLowerCase())
        );

        if (seedMatch) {
          foundCourse = {
            id: seedMatch.id || id,
            title: seedMatch.title,
            description: seedMatch.description,
            category: seedMatch.category,
            chapters: (seedMatch.modules || []).map((m, mIdx) => ({
              id: m.id || `mod-${mIdx + 1}`,
              title: m.title,
              duration: `${m.lessons?.length || 4} lectures`,
              order: mIdx + 1,
              lessons: (m.lessons || []).map((les, lIdx) => ({
                id: les.id,
                title: les.title,
                description: les.description,
                videoUrl: les.videoUrl,
                youtubeVideoId: les.youtubeVideoId,
                author: les.author,
                duration: les.duration || "20 min",
                order: les.order || (lIdx + 1)
              }))
            }))
          };
        }
      }

      if (!foundCourse) {
        setCourse(null);
        setLoading(false);
        return;
      }

      setCourse(foundCourse);
      const chaps = foundCourse.chapters || [];
      setChapters(chaps);

      let progress = null;
      try {
        const progRes = await api.get(`/Courses/${id}/progress`);
        if (progRes.data) {
          progress = progRes.data;
        }
      } catch {
        // ignore
      }

      if (!progress || !progress.isEnrolled) {
        progress = {
          isEnrolled: false,
          progressPercent: 0,
          completedLessonsCount: 0,
          totalLessonsCount: chaps.reduce((acc, c) => acc + (c.lessons?.length || 0), 0),
          completedLessonIds: [],
          unlockedLessonIds: [],
          unlockedChapterIds: [],
          currentLessonId: chaps[0]?.lessons?.[0]?.id || null,
          isCompleted: false
        };
      }

      setProgressData(progress);

      let target = null;
      let targetChapterTitle = "";

      if (lessonId) {
        for (const chap of chaps) {
          const matched = (chap.lessons || []).find(
            (l) => String(l.id) === String(lessonId) || String(l.order) === String(lessonId)
          );
          if (matched) {
            target = matched;
            targetChapterTitle = chap.title;
            break;
          }
        }
      }

      if (!target) {
        const activeId = progress?.currentLessonId || chaps[0]?.lessons?.[0]?.id;
        for (const chap of chaps) {
          const matched = (chap.lessons || []).find((l) => l.id === activeId);
          if (matched) {
            target = matched;
            targetChapterTitle = chap.title;
            break;
          }
        }
      }

      if (!target && chaps[0]?.lessons?.[0]) {
        target = chaps[0].lessons[0];
        targetChapterTitle = chaps[0].title;
      }

      if (target) {
        await verifyAndSetLesson(target, targetChapterTitle, progress, foundCourse);
      }
    } catch (err) {
      console.warn("Could not load course data:", err.message);
    } finally {
      setLoading(false);
    }
  }, [id, lessonId]);

  useEffect(() => {
    loadCourseAndProgress();
  }, [loadCourseAndProgress]);

  // Backend protected lesson verification
  const verifyAndSetLesson = async (lesson, chapterTitle, currentProgress, currentCourse) => {
    setIsPlaying(false);
    stopTrackingInterval();
    setCompletionError("");

    const activeProgress = currentProgress || progressData;
    const courseId = currentCourse?.id || id;
    const isUnlockedInList = activeProgress?.unlockedLessonIds?.includes(lesson.id);

    try {
      const res = await api.get(`/Courses/${courseId}/lessons/${lesson.id}`);
      if (res.data) {
        const lessonData = res.data;
        setIsLessonLocked(Boolean(lessonData.isLocked));
        setLockReason(lessonData.lockReason || "");

        const isComp = Boolean(lessonData.completed);
        const reqMet = Boolean(lessonData.videoRequirementCompleted || isComp || (lessonData.watchedPercentage >= 90));

        setVideoProgress({
          watchedSeconds: lessonData.watchedSeconds || 0,
          duration: lessonData.videoDuration || 0,
          percentage: lessonData.watchedPercentage || (isComp ? 100 : 0),
          requirementMet: reqMet,
          lastPositionSeconds: lessonData.lastPositionSeconds || 0
        });

        setCurrentLesson({
          ...lesson,
          videoUrl: lessonData.videoUrl || lesson.videoUrl,
          youtubeVideoId: lessonData.youtubeVideoId || lesson.youtubeVideoId,
          chapterTitle: chapterTitle || lesson.chapterTitle
        });
        return;
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const errorData = err.response.data;
        setIsLessonLocked(true);
        setLockReason(errorData?.lockReason || "Complete the previous lesson to unlock this lesson.");
        setCurrentLesson({
          ...lesson,
          videoUrl: null,
          youtubeVideoId: null,
          chapterTitle: chapterTitle || lesson.chapterTitle
        });
        return;
      }
    }

    if (!isUnlockedInList) {
      setIsLessonLocked(true);
      setLockReason("Complete the previous lesson to unlock this lesson.");
      setCurrentLesson({
        ...lesson,
        videoUrl: null,
        youtubeVideoId: null,
        chapterTitle: chapterTitle || lesson.chapterTitle
      });
    } else {
      setIsLessonLocked(false);
      setLockReason("");
      setCurrentLesson({
        ...lesson,
        chapterTitle: chapterTitle || lesson.chapterTitle
      });
    }
  };

  const flattenedLessons = useMemo(() => {
    return chapters.flatMap((chap) =>
      (chap.lessons || []).map((les) => ({
        ...les,
        chapterId: chap.id,
        chapterTitle: chap.title
      }))
    );
  }, [chapters]);

  const currentIndex = flattenedLessons.findIndex(
    (l) => (l.id && l.id === currentLesson?.id) || l.title === currentLesson?.title
  );

  const totalLessons = progressData.totalLessonsCount || flattenedLessons.length || 1;
  const completedLessons = progressData.completedLessonsCount;
  const progressPercent = progressData.progressPercent;

  const handleSelectLesson = async (lesson, chapterTitle) => {
    const basePath = location.pathname.startsWith("/courses") ? "/courses" : "/student/courses";
    navigate(`${basePath}/${id}/learn/${lesson.id}`, { replace: true });
    await verifyAndSetLesson(lesson, chapterTitle, progressData, course);
  };

  const handleNextLesson = async () => {
    if (currentIndex >= 0 && currentIndex < flattenedLessons.length - 1) {
      const next = flattenedLessons[currentIndex + 1];
      await handleSelectLesson(next, next.chapterTitle);
    }
  };

  const handlePrevLesson = async () => {
    if (currentIndex > 0) {
      const prev = flattenedLessons[currentIndex - 1];
      await handleSelectLesson(prev, prev.chapterTitle);
    }
  };

  // Mark Lesson as Completed - enforces backend validation
  const handleMarkComplete = async () => {
    if (!currentLesson || completing || isLessonLocked) return;

    try {
      setCompleting(true);
      setCompletionError("");

      const res = await api.post(`/Courses/${id}/lessons/${currentLesson.id}/complete`);

      if (res.data?.success) {
        const progRes = await api.get(`/Courses/${id}/progress`);
        if (progRes.data) {
          setProgressData(progRes.data);

          setCurrentLesson((prev) => ({
            ...prev,
            completed: true
          }));

          setVideoProgress((prev) => ({
            ...prev,
            requirementMet: true,
            percentage: 100
          }));

          if (res.data.nextLessonId) {
            const nextL = flattenedLessons.find((l) => l.id === res.data.nextLessonId);
            if (nextL) {
              setTimeout(() => {
                handleSelectLesson(nextL, nextL.chapterTitle);
              }, 400);
            }
          }
        }
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || "Failed to mark lesson completed.";
      setCompletionError(serverMsg);
    } finally {
      setCompleting(false);
    }
  };

  const handleClaimCertificate = async () => {
    try {
      await api.post(`/certificates/claim/${id}`);
    } catch {
      // Navigate to certificates
    }
    navigate("/student/certificates");
  };

  const isCurrentCompleted = progressData.completedLessonIds.includes(currentLesson?.id);
  const activeVideoId = !isLessonLocked ? getYoutubeId(currentLesson) : "";

  const nextLessonCandidate = currentIndex >= 0 && currentIndex < flattenedLessons.length - 1
    ? flattenedLessons[currentIndex + 1]
    : null;
  const isNextUnlocked = nextLessonCandidate
    ? progressData.unlockedLessonIds.includes(nextLessonCandidate.id)
    : false;

  const currentChapter = chapters.find((c) => (c.lessons || []).some((l) => l.id === currentLesson?.id));
  const isLastLessonInModule = currentChapter && currentChapter.lessons?.slice(-1)[0]?.id === currentLesson?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Validating sequential syllabus milestones & playback tracking...
          </p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
          <h2 className="text-base font-bold text-slate-900">Course Syllabus Not Available</h2>
          <p className="text-xs text-slate-500">The requested course could not be loaded.</p>
          <Link to="/courses" className="inline-block mt-2">
            <Button variant="primary" size="sm">Browse Verified Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Learning Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/student/courses"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Back to My Courses"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {course?.title || "Academic Learning Track"}
            </h1>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
              <span>{currentLesson.chapterTitle || "Course Curriculum"}</span>
              <span>•</span>
              <span className="font-medium text-slate-600 truncate">{currentLesson.title}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5 w-48">
            <ProgressBar value={progressPercent} max={100} height="h-2" color="indigo" />
            <span className="text-xs font-bold text-slate-700 shrink-0">
              {progressPercent}%
            </span>
          </div>

          <Link to={`/student/ai-assistant?courseId=${course.id}&lessonId=${currentLesson.id}`}>
            <Button variant="secondary" size="sm" icon={Sparkles}>
              AI Tutor
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Chapters & Lessons Sidebar */}
        <aside className="w-full lg:w-84 bg-white border-r border-slate-200 flex flex-col shrink-0 lg:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Sequential Syllabus</span>
              <Badge variant={progressData.isCompleted ? "emerald" : "indigo"} size="sm">
                {chapters.length} Modules
              </Badge>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              <strong>{completedLessons}</strong> of <strong>{totalLessons}</strong> lessons completed ({progressPercent}%)
            </p>
          </div>

          <div className="p-2 space-y-3">
            {chapters.map((chap, cidx) => {
              const isChapterUnlocked = progressData.unlockedChapterIds.includes(chap.id);
              const chapterLessons = chap.lessons || [];
              const allLessonsInChapterCompleted =
                chapterLessons.length > 0 &&
                chapterLessons.every((l) => progressData.completedLessonIds.includes(l.id));

              return (
                <div key={chap.id || cidx} className="space-y-1">
                  {/* Module Header */}
                  <div
                    className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                      allLessonsInChapterCompleted
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200/60"
                        : isChapterUnlocked
                        ? "bg-slate-100/80 text-slate-800"
                        : "bg-slate-50 text-slate-400 border border-slate-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {allLessonsInChapterCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : isChapterUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{chap.title}</span>
                    </div>

                    <span className="text-[10px] font-normal shrink-0 ml-1">
                      {chap.lessons?.length || 0} lessons
                    </span>
                  </div>

                  {/* Lessons List */}
                  <div className="space-y-0.5">
                    {(chap.lessons || []).map((lesson) => {
                      const isCompleted = progressData.completedLessonIds.includes(lesson.id);
                      const isUnlocked = progressData.unlockedLessonIds.includes(lesson.id);
                      const isSelected = currentLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id || lesson.title}
                          onClick={() => handleSelectLesson(lesson, chap.title)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/90 text-indigo-950 font-semibold border border-indigo-200/90 shadow-2xs"
                              : !isUnlocked
                              ? "text-slate-400 bg-slate-50/30 hover:bg-slate-50/60 opacity-80"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : !isUnlocked ? (
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          ) : isSelected ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs leading-snug line-clamp-2 ${!isUnlocked ? "text-slate-400" : ""}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">
                                {lesson.duration || "20 min"}
                              </span>
                              {!isUnlocked ? (
                                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                  Locked
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                  Completed
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right: Lesson Player, Watch Progress & Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto lg:h-[calc(100vh-3.5rem)] space-y-6">
          {/* Responsive 16:9 Video Container */}
          <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden relative shadow-xl border border-slate-900">
            {isLessonLocked ? (
              <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 text-amber-400 flex items-center justify-center mb-3 shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                  Lesson Locked
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-4 leading-relaxed">
                  {!progressData.isEnrolled
                    ? "You must enroll in this course to access its lessons and verified lecture materials."
                    : lockReason || "Complete the previous lesson to unlock this lesson."}
                </p>
                {!progressData.isEnrolled ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      try {
                        await api.post(`/courses/${course.id}/enroll`);
                        window.location.reload();
                      } catch (err) {
                        console.error("Enrollment failed:", err);
                      }
                    }}
                  >
                    Enroll in this Course Now
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const activeId = progressData.currentLessonId || progressData.unlockedLessonIds[0];
                      const activeL = flattenedLessons.find((l) => l.id === activeId);
                      if (activeL) {
                        handleSelectLesson(activeL, activeL.chapterTitle);
                      }
                    }}
                  >
                    Go to Active Unlocked Lesson
                  </Button>
                )}
              </div>
            ) : isPlaying && activeVideoId ? (
              <div id="yt-player-target" className="w-full h-full border-0 absolute inset-0" />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center group overflow-hidden">
                {activeVideoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`}
                    alt={currentLesson.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black" />
                )}

                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />

                <div className="relative text-center text-white space-y-3 sm:space-y-4 p-6 z-10 max-w-xl">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/20"
                    aria-label="Play Lesson Video"
                  >
                    <PlayCircle className="w-9 h-9 sm:w-11 sm:h-11" />
                  </button>

                  <div className="space-y-1">
                    <h2 className="text-base sm:text-xl font-bold leading-snug drop-shadow-sm line-clamp-2">
                      {currentLesson.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Interactive Lecture & Video Demonstration • {currentLesson.duration || "20 min"}
                    </p>
                  </div>

                  {currentLesson.author && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-xs text-indigo-200 border border-white/15">
                        <Video className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Educator:</span>
                        <strong className="text-white font-bold">{currentLesson.author}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real Playback Watch Requirement & Progress Bar */}
          {!isLessonLocked && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {videoProgress.requirementMet || isCurrentCompleted ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      ✓ Video requirement completed ({videoProgress.percentage}%)
                    </span>
                  ) : (
                    <span className="text-slate-300 font-semibold">
                      Video Progress: <strong className="text-indigo-400">{videoProgress.percentage}%</strong>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatTime(videoProgress.watchedSeconds)} / {formatTime(videoProgress.duration || 1200)}
                </span>
              </div>

              {/* Watched Progress Indicator Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    videoProgress.requirementMet || isCurrentCompleted ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(videoProgress.percentage, isCurrentCompleted ? 100 : 0))}%` }}
                />
              </div>

              {/* Requirement Explanation */}
              {!videoProgress.requirementMet && !isCurrentCompleted ? (
                <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  Watch at least 90% of this video to complete the lesson. Seeking or leaving the tab does not count.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-0.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  Watch requirement satisfied. You can now mark this lesson as completed!
                </p>
              )}
            </div>
          )}

          {/* Server Validation Error Banner (if bypass attempted) */}
          {completionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{completionError}</span>
            </div>
          )}

          {/* Navigation & Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              onClick={handlePrevLesson}
              disabled={currentIndex <= 0}
            >
              Previous Lesson
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Mark as Completed Button - Strictly Disabled until 90% watch threshold is met */}
              <Button
                variant={isCurrentCompleted ? "secondary" : "primary"}
                size="sm"
                icon={isCurrentCompleted ? CheckCircle2 : Check}
                onClick={handleMarkComplete}
                disabled={
                  isCurrentCompleted ||
                  isLessonLocked ||
                  completing ||
                  (!videoProgress.requirementMet && !isCurrentCompleted)
                }
                title={
                  !videoProgress.requirementMet && !isCurrentCompleted
                    ? "Watch at least 90% of the video to enable lesson completion"
                    : ""
                }
              >
                {completing
                  ? "Verifying Playback..."
                  : isCurrentCompleted
                  ? "Completed"
                  : !videoProgress.requirementMet
                  ? `Watch 90% to Complete (${videoProgress.percentage}%)`
                  : "Mark as Completed"}
              </Button>

              {progressData.isCompleted ? (
                <Button variant="primary" size="sm" icon={Award} onClick={handleClaimCertificate}>
                  Claim Certificate
                </Button>
              ) : isLastLessonInModule && isCurrentCompleted ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ChevronRight}
                  onClick={handleNextLesson}
                  disabled={!isNextUnlocked}
                >
                  Next Module →
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  onClick={handleNextLesson}
                  disabled={currentIndex >= flattenedLessons.length - 1 || !isNextUnlocked}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </div>

          {/* Course Completion Banner */}
          {progressData.isCompleted && (
            <Card className="p-5 sm:p-6 bg-emerald-50 border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-950">
                    Course Fully Completed! 🎉
                  </h3>
                  <p className="text-xs text-emerald-800">
                    You have successfully completed all modules and lessons in {course.title}.
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" icon={Award} onClick={handleClaimCertificate} className="shrink-0">
                View Certificate
              </Button>
            </Card>
          )}

          {/* Lesson Content & Reading Notes */}
          <Card className="p-6 sm:p-8 space-y-4 shadow-sm bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentLesson.title}
                </h3>
                <span className="text-xs text-slate-400">
                  Curriculum Module: {currentLesson.chapterTitle || "Course Curriculum"}
                </span>
              </div>
              {!isLessonLocked && currentLesson.videoUrl && (
                <a
                  href={currentLesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                  title="Open source video reference on YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">YouTube Reference</span>
                </a>
              )}
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                {isLessonLocked
                  ? "This lesson is currently locked in your curriculum sequence. To unlock the full lecture materials, notes, and interactive demonstrations, please complete the preceding lessons."
                  : currentLesson.description ||
                    `In this lecture on "${currentLesson.title}", students explore foundational concepts, system architectures, and hands-on implementations.`}
              </p>

              {currentLesson.author && !isLessonLocked && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">Verified Educational Source</p>
                    <p className="text-slate-500 text-[11px]">
                      Delivered by <strong>{currentLesson.author}</strong> via verified YouTube educational channels.
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm">Verified Syllabus</Badge>
                </div>
              )}
            </div>

            {/* AI Tutor Assistant CTA with Context */}
            <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">
                    Stuck or have questions about {currentLesson.title}?
                  </h4>
                  <p className="text-[11px] text-indigo-900/80">
                    Our Gemini-powered AI Tutor understands your current lesson context and can provide instant explanations or code examples.
                  </p>
                </div>
              </div>
              <Link to={`/student/ai-assistant?courseId=${course.id}&lessonId=${currentLesson.id}`} className="shrink-0">
                <Button variant="primary" size="sm">
                  Ask AI Tutor
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
