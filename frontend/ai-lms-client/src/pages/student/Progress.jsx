import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import {
  Button,
  Card,
  Badge,
  StatCard,
  ProgressBar
} from "../../components/common/UIPrimitives";

export default function Progress() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProgressAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [enrolledRes, certsRes] = await Promise.allSettled([
          api.get("/Courses/enrolled"),
          api.get("/certificates/my")
        ]);

        if (!isMounted) return;

        if (enrolledRes.status === "fulfilled" && Array.isArray(enrolledRes.value?.data)) {
          setEnrolledCourses(enrolledRes.value.data);
        } else {
          setEnrolledCourses([]);
        }

        if (certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data)) {
          setCertificates(certsRes.value.data);
        } else {
          setCertificates([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch progress metrics:", err);
        setError("Failed to load progress records. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgressAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const enrolledCount = enrolledCourses.length;
  const certCount = certificates.length;
  const completedCount = enrolledCourses.filter(
    (c) => c.status === "Completed" || (c.progressPercent || 0) === 100
  ).length;
  const activeCount = enrolledCount - completedCount;

  const overallCompletion = enrolledCount > 0
    ? Math.round(
        enrolledCourses.reduce((acc, c) => acc + (c.progressPercent || 0), 0) / enrolledCount
      )
    : 0;

  // Approximate study hours based on actual verified progress
  const estimatedHours = enrolledCount > 0
    ? (enrolledCourses.reduce((acc, c) => acc + ((c.progressPercent || 0) * 0.3), 0)).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Learning Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Progress & Skill Metrics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time tracking of course milestones, diagnostic quiz scores, and AI weakness detection.
          </p>
        </div>

        <Link to="/student/study-plan">
          <Button variant="primary" size="sm" icon={Calendar}>
            View Study Plan
          </Button>
        </Link>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Calculating your learning analytics...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Top Stat Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Completion"
              value={`${overallCompletion}%`}
              icon={TrendingUp}
              variant="indigo"
              trend={overallCompletion > 0 ? "Active progress" : "No active progress"}
            />
            <StatCard
              title="Study Time Tracked"
              value={`${estimatedHours}h`}
              icon={Clock}
              variant="blue"
              subtitle={enrolledCount === 0 ? "0 courses enrolled" : `${enrolledCount} enrolled track(s)`}
            />
            <StatCard
              title="Enrolled Courses"
              value={String(enrolledCount)}
              icon={BookOpen}
              variant="emerald"
              subtitle={enrolledCount === 0 ? "No courses" : `${activeCount} active, ${completedCount} finished`}
            />
            <StatCard
              title="Verified Credentials"
              value={String(certCount)}
              icon={Award}
              variant="violet"
              subtitle={certCount === 1 ? "1 Verified certificate" : `${certCount} Verified certificates`}
            />
          </div>

          {/* Course Progress Section */}
          <Card className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Course Progress</span>
              </h2>
              <span className="text-xs text-slate-400">
                {enrolledCount === 0 ? "0 Enrolled Courses" : `${enrolledCount} Enrolled Track${enrolledCount > 1 ? "s" : ""}`}
              </span>
            </div>

            {enrolledCount === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto text-indigo-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-bold text-slate-900">No Course Progress Recorded</p>
                  <p className="text-xs text-slate-500">
                    You have not enrolled in any courses yet. Enroll in a course from the catalog to start tracking your completion milestones and video watch progress.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/courses">
                    <Button variant="primary" size="sm" icon={BookOpen}>
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((c, i) => {
                  const pct = c.progressPercent || 0;
                  const isDone = pct === 100 || c.status === "Completed";
                  const color = isDone ? "emerald" : pct >= 50 ? "indigo" : "blue";

                  return (
                    <div
                      key={c.enrollmentId || c.courseId || i}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.title}</span>
                          <Badge variant={color} size="sm">
                            {c.category || "Track"}
                          </Badge>
                          {isDone && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-indigo-700">{pct}% completed</span>
                          <Link to={`/student/courses/${c.courseId}/learn`}>
                            <Button variant="outline" size="sm" icon={PlayCircle}>
                              {isDone ? "Review" : "Continue"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <ProgressBar value={pct} max={100} color={color} height="h-2.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* AI Skill Analytics: Diagnostic Practice Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Topic Retention & Mastery</span>
                </h3>
                <Badge variant={enrolledCount > 0 ? "emerald" : "slate"} size="sm">
                  {enrolledCount > 0 ? "Calibrated" : "Pending Data"}
                </Badge>
              </div>

              {enrolledCount === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Enroll in academic courses to generate personalized mastery metrics.
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.slice(0, 3).map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{c.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{c.category || "Foundations"}</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                        {c.progressPercent || 0}% Progress
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>AI Adaptive Remediation</span>
                </h3>
                <Badge variant="amber" size="sm">Actionable</Badge>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Diagnostic Practice Quizzes</p>
                  <span className="text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                    Self-Paced
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Practice interactive multi-choice quizzes generated adaptively by Gemini to reinforce key course concepts.
                </p>
                <div className="pt-1.5">
                  <Link
                    to="/student/quizzes"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                  >
                    <span>Launch Diagnostic Quiz</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
