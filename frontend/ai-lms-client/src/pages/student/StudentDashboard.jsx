import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import coursesSeedData from "../../data/courses_seed.json";
import {
  BookOpen,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Play,
  Calendar,
  HelpCircle,
  Clock,
  CheckCircle2,
  FileText
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  StatCard,
  ProgressBar
} from "../../components/common/UIPrimitives";

function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Student";
  const [activeCourse, setActiveCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [enrolledRes, certsRes] = await Promise.allSettled([
          api.get("/Courses/enrolled"),
          api.get("/certificates/my")
        ]);

        if (!isMounted) return;

        let userEnrolled = [];
        if (enrolledRes.status === "fulfilled" && Array.isArray(enrolledRes.value?.data)) {
          userEnrolled = enrolledRes.value.data;
          setEnrolledCourses(userEnrolled);
        } else {
          setEnrolledCourses([]);
        }

        if (certsRes.status === "fulfilled" && Array.isArray(certsRes.value?.data)) {
          setCertificates(certsRes.value.data);
        } else {
          setCertificates([]);
        }

        // Set active course strictly from student's own enrollments
        if (userEnrolled.length > 0) {
          const active = userEnrolled.find((c) => c.status !== "Completed") || userEnrolled[0];
          setActiveCourse({
            id: active.courseId,
            title: active.title,
            category: active.category || "General",
            lessonTitle: active.status === "Completed" ? "Curriculum Completed" : "Continue Next Module",
            thumbnail: active.thumbnail || "/images/courses/default-course.jpg",
            progressPercent: active.progressPercent || 0,
            status: active.status || "Active"
          });
        } else {
          setActiveCourse(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Dashboard data load error:", err);
          setActiveCourse(null);
          setEnrolledCourses([]);
          setCertificates([]);
        }
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCourseId = activeCourse?.id || null;
  const enrolledCount = enrolledCourses.length;
  const certCount = certificates.length;
  const activeCount = enrolledCourses.filter(c => c.status !== "Completed").length;
  const finishedCount = enrolledCourses.filter(c => c.status === "Completed").length;
  const avgProgress = enrolledCount > 0
    ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progressPercent || 0), 0) / enrolledCount)
    : 0;

  const recommendations = [
    {
      type: "Recommended Practice",
      title: "Diagnostic Curriculum Assessment",
      reason: "Calibrate knowledge gaps and evaluate topic retention.",
      duration: "15 min quiz",
      link: "/student/quizzes"
    },
    {
      type: enrolledCount > 0 ? "Next Course Module" : "Explore Tracks",
      title: activeCourse ? activeCourse.title : "Curated Engineering & AI Tracks",
      reason: activeCourse ? "Prerequisite lecture for comprehensive track milestone." : "Enroll in an academic course to start sequential progression.",
      duration: activeCourse ? "Next lesson" : "Self-paced",
      link: activeCourse ? `/student/courses/${activeCourse.id}/learn` : "/courses"
    }
  ];

  const recentActivity = [];
  if (certCount > 0) {
    recentActivity.push({
      title: `Earned Certificate: ${certificates[0].courseTitle}`,
      score: "Verified",
      time: "Recently",
      icon: Award,
      variant: "text-amber-600 bg-amber-50"
    });
  }
  if (enrolledCount > 0) {
    recentActivity.push({
      title: `Active Course: ${enrolledCourses[0].title}`,
      score: `${enrolledCourses[0].progressPercent || 0}% Progress`,
      time: "In Progress",
      icon: CheckCircle2,
      variant: "text-emerald-600 bg-emerald-50"
    });
  } else {
    recentActivity.push({
      title: "Welcome to Learnova AI! Explore courses to enroll.",
      score: "Catalog",
      time: "Just now",
      icon: BookOpen,
      variant: "text-indigo-600 bg-indigo-50"
    });
  }
  recentActivity.push({
    title: "Diagnostic Assessment Available",
    score: "Ready",
    time: "Today",
    icon: FileText,
    variant: "text-indigo-600 bg-indigo-50"
  });

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Continue your learning journey and achieve your weekly goals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/courses">
            <Button variant="secondary" size="sm" icon={BookOpen}>
              Browse Courses
            </Button>
          </Link>
          <Link to="/student/ai-assistant">
            <Button variant="primary" size="sm" icon={Sparkles}>
              AI Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Statistics Grid (4 Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Courses"
          value={String(enrolledCount)}
          icon={BookOpen}
          variant="indigo"
          subtitle={enrolledCount === 0 ? "No courses enrolled" : `${activeCount} active, ${finishedCount} finished`}
        />
        <StatCard
          title="Avg Progress"
          value={`${avgProgress}%`}
          icon={TrendingUp}
          variant="blue"
          trend={avgProgress > 0 ? "Active progress" : "Start learning"}
        />
        <StatCard
          title="Quizzes"
          value={enrolledCount > 0 ? "Ready" : "0%"}
          icon={HelpCircle}
          variant="emerald"
          subtitle={enrolledCount > 0 ? "Diagnostic Available" : "Enroll to practice"}
        />
        <StatCard
          title="Certificates"
          value={String(certCount)}
          icon={Award}
          variant="violet"
          subtitle={certCount === 1 ? "1 Verified credential" : `${certCount} Verified credentials`}
        />
      </div>

      {/* 3. Main Priority Split: Continue Learning (Left) & Upcoming Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Continue Learning
            </h2>
            <Link
              to="/student/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>View all enrolled</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Priority Course Card */}
          {!activeCourse ? (
            <Card className="p-6 sm:p-8 text-center space-y-4 border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Welcome to Learnova AI!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  You are not currently enrolled in any courses. Explore our curated academic tracks to enroll and start your personalized learning journey with AI-driven progress tracking.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/courses">
                  <Button variant="primary" size="sm" icon={BookOpen}>
                    Explore Course Catalog
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-5 sm:p-6 hover:border-slate-300">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-44 h-28 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 aspect-video sm:aspect-auto">
                  <img
                    src={activeCourse.thumbnail || "/images/courses/default-course.jpg"}
                    alt={activeCourse.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/courses/default-course.jpg";
                    }}
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-slate-800 shadow-2xs">
                    {activeCourse.category || "Technology"}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={activeCourse.status === "Completed" ? "emerald" : "indigo"} size="sm">
                        {activeCourse.status === "Completed" ? "Completed" : "In Progress"}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">Active Track</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                      {activeCourse.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {activeCourse.lessonTitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <ProgressBar
                      value={activeCourse.progressPercent || 0}
                      max={100}
                      showLabel
                      color={activeCourse.progressPercent === 100 ? "emerald" : "indigo"}
                      height="h-2"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {activeCourse.status === "Completed"
                      ? "All lessons completed"
                      : `${activeCourse.progressPercent || 0}% overall course progress`}
                  </span>
                </span>
                <Link to={`/student/courses/${activeCourse.id}/learn`}>
                  <Button variant="primary" size="sm" icon={Play}>
                    {activeCourse.status === "Completed" ? "Review Course" : "Resume Course"}
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Upcoming Quiz & Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Upcoming Tasks
            </h2>
            <Link
              to="/student/quizzes"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Quizzes
            </Link>
          </div>

          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">Midterm Quiz: DBMS</p>
                  <Badge variant="amber" size="sm">Due Friday</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  15 adaptive questions on 1NF-BCNF & B+ Trees
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Link to="/student/quizzes">
                <Button variant="outline" size="sm">
                  Start Practice
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">Weekly Study Goal</p>
                  <span className="text-xs font-extrabold text-indigo-600">
                    {enrolledCount > 0 ? "8.5 / 12h" : "0 / 12h"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {enrolledCount > 0
                    ? "3.5 hours remaining to hit your target."
                    : "Enroll in a course to start tracking study hours."}
                </p>
                <div className="mt-2">
                  <ProgressBar value={enrolledCount > 0 ? 8.5 : 0} max={12} color="indigo" height="h-1.5" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              AI Recommendations For You
            </h2>
          </div>
          <Link
            to="/student/recommendations"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <Card key={i} className="p-5 flex flex-col justify-between hover:border-slate-300">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="indigo" size="sm">
                    {rec.type}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-medium">{rec.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rec.reason}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link to={rec.link}>
                  <Button variant="outline" size="sm" icon={ArrowRight}>
                    Review Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Recent Activity Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Recent Activity
        </h2>
        <Card className="divide-y divide-slate-100">
          {recentActivity.map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.variant}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.time}</p>
                  </div>
                </div>
                <Badge variant="slate" size="sm">{act.score}</Badge>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

export default StudentDashboard;
