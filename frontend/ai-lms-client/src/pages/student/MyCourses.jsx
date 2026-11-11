import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Award, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import {
  Button,
  Card,
  Badge,
  ProgressBar
} from "../../components/common/UIPrimitives";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/Courses/enrolled");
        if (!isMounted) return;

        if (Array.isArray(res.data)) {
          const mapped = res.data.map((e) => ({
            id: e.courseId,
            enrollmentId: e.enrollmentId,
            title: e.title || "Course",
            category: e.category || "General",
            thumbnail: e.thumbnail || "/images/courses/default-course.jpg",
            progress: e.progressPercent || 0,
            status: e.status || (e.progressPercent === 100 ? "Completed" : "Active"),
            enrolledAt: e.enrolledAt,
            completedAt: e.completedAt
          }));
          setCourses(mapped);
        } else {
          setCourses([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch enrolled courses:", err);
        setError("Unable to load your enrolled courses. Please check your connection.");
        setCourses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEnrolledCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Active Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Pick up where you left off and complete your learning milestones.
          </p>
        </div>

        <Link to="/courses">
          <Button variant="primary" size="sm" icon={BookOpen}>
            Explore More Courses
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Loading enrolled courses...</p>
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

      {/* Empty State: Zero Enrollments */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-16 px-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              No Enrolled Courses Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You are not currently enrolled in any courses. Browse available academic tracks in the course catalog to enroll and start learning with personalized AI progress tracking.
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
      )}

      {/* Enrolled Courses Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <Card key={c.id} hover className="overflow-hidden flex flex-col justify-between">
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={c.thumbnail || "/images/courses/default-course.jpg"}
                  alt={c.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/courses/default-course.jpg";
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <Badge variant="indigo" size="sm">
                    {c.category}
                  </Badge>
                  {c.status === "Completed" && (
                    <Badge variant="emerald" size="sm">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Status:</span>
                    <span className="font-semibold text-slate-700">{c.status}</span>
                    {c.status === "Completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <ProgressBar
                    value={c.progress}
                    max={100}
                    showLabel
                    color={c.progress === 100 ? "emerald" : "indigo"}
                    height="h-2"
                  />

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Link
                      to={`/student/courses/${c.id}/learn`}
                      className="flex-1"
                    >
                      <Button variant="primary" size="sm" className="w-full" icon={PlayCircle}>
                        {c.progress === 100 ? "Review Course" : c.progress > 0 ? "Resume Course" : "Start Learning"}
                      </Button>
                    </Link>

                    <Link to={`/student/courses/${c.id}`}>
                      <Button variant="secondary" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
