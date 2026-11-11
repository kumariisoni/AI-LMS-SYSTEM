import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  BookOpen,
  Users,
  HelpCircle,
  BrainCircuit,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { Card, Badge, Button, StatCard } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";

function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFacultyData = useCallback(async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        api.get("/Faculty/dashboard").catch(() => ({ data: null })),
        api.get("/Courses").catch(() => ({ data: [] })),
      ]);

      if (dashRes.data) {
        setData(dashRes.data);
      }
      if (Array.isArray(coursesRes.data)) {
        const myCourses = coursesRes.data.filter(
          (c) => c.instructorId === user?.id || c.instructorName?.toLowerCase()?.includes(user?.name?.toLowerCase() || "")
        );
        setCourses(myCourses.length > 0 ? myCourses : coursesRes.data.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to load faculty dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFacultyData();
  }, [fetchFacultyData]);

  const atRiskStudents = [
    { name: "Rahul Verma", course: "Database Management Systems", score: "42%", issue: "Struggling with 3NF/BCNF Decomposition", trend: "down" },
    { name: "Sneha Patel", course: "Cloud Architecture", score: "48%", issue: "Incomplete Distributed Labs", trend: "down" },
    { name: "Amit Sharma", course: "Machine Learning Foundations", score: "51%", issue: "Low Quiz 2 Engagement", trend: "down" },
  ];

  const recentSubmissions = [
    { student: "Ananya Roy", course: "DBMS Normalization Lab", time: "25 min ago", grade: "Pending" },
    { student: "Vikram Das", course: "React 19 Server Components", time: "1 hour ago", grade: "Graded (95%)" },
    { student: "Karan Johar", course: "Cloud Microservices API", time: "3 hours ago", grade: "Graded (88%)" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* 1. Instructor Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty Studio
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Manage courses, evaluate submissions, and review AI insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/faculty/create-course">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Create Course
            </Button>
          </Link>
          <Link to="/faculty/ai-insights">
            <Button variant="outline" size="sm" icon={BrainCircuit}>
              AI Insights
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Course Statistics (4 Compact StatCards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={loading ? "..." : courses.length || 4}
          icon={BookOpen}
          variant="indigo"
          subtitle="Published academic curricula"
        />
        <StatCard
          title="Enrolled Learners"
          value={loading ? "..." : data?.stats?.totalStudents || "1,248"}
          icon={Users}
          variant="blue"
          trend="+8% this month"
        />
        <StatCard
          title="Diagnostic Quizzes"
          value={loading ? "..." : data?.stats?.totalQuizzes || "14"}
          icon={HelpCircle}
          variant="violet"
          subtitle="Automated assessments"
        />
        <StatCard
          title="Class Average"
          value="84.2%"
          icon={TrendingUp}
          variant="emerald"
          subtitle="+3.5% vs cohort baseline"
        />
      </div>

      {/* 3. Main Workspace Split: My Courses (Left) & AI Insights / At-Risk (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My Active Courses
            </h2>
            <Link
              to="/faculty/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 3).map((course, idx) => (
              <Card key={idx} className="p-4 sm:p-5 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo" size="sm">
                        {course.category || "Technology"}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {course.level || "Intermediate"}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {course.title || course.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {course.enrolledCount || 480} students enrolled • 3 chapters
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/faculty/courses`}>
                      <Button variant="outline" size="sm">
                        Curriculum
                      </Button>
                    </Link>
                    <Link to={`/faculty/performance`}>
                      <Button variant="secondary" size="sm">
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Submissions Table */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Submissions
              </h2>
              <Link to="/faculty/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                View all submissions
              </Link>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Learner</th>
                      <th className="p-3.5">Assignment</th>
                      <th className="p-3.5">Submitted</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentSubmissions.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{sub.student}</td>
                        <td className="p-3.5 text-slate-600">{sub.course}</td>
                        <td className="p-3.5 text-slate-400">{sub.time}</td>
                        <td className="p-3.5 text-right">
                          <Badge variant={sub.grade === "Pending" ? "amber" : "emerald"} size="sm">
                            {sub.grade}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right 1 Col: At-Risk Watchlist & Pedagogical Recommendations */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  At-Risk Learners
                </h3>
              </div>
              <Badge variant="amber" size="sm">Action Needed</Badge>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map((st, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{st.name}</span>
                    <span className="text-xs font-extrabold text-red-600">{st.score}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{st.course}</p>
                  <p className="text-[11px] text-amber-700 font-medium">{st.issue}</p>
                </div>
              ))}
            </div>

            <Link to="/faculty/ai-insights" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full" icon={BrainCircuit}>
                Generate Remedial Quiz
              </Button>
            </Link>
          </Card>

          {/* AI Teaching Recommendation */}
          <Card className="p-5 space-y-3 bg-indigo-50/40 border-indigo-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Pedagogical AI Insight
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              46% of learners struggled with BCNF functional decomposition in the DBMS Chapter 3 quiz. We recommend scheduling a 15-minute concept review session.
            </p>
            <div className="pt-2">
              <Link to="/faculty/ai-insights">
                <span className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1">
                  View Full Analytics <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
