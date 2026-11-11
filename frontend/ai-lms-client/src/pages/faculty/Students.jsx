import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Mail
} from "lucide-react";
import { Card, Badge, Button, Avatar, ProgressBar } from "../../components/common/UIPrimitives";

function Students() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");

  const studentRoster = [
    {
      id: "st-1",
      name: "Aarav Sharma",
      email: "aarav.sharma@learnova.edu",
      course: "Database Management Systems",
      progress: 92,
      quizAvg: 94,
      status: "Good",
      lastActive: "Today, 10:45 AM"
    },
    {
      id: "st-2",
      name: "Rahul Verma",
      email: "rahul.v@learnova.edu",
      course: "Database Management Systems",
      progress: 45,
      quizAvg: 42,
      status: "At-Risk",
      lastActive: "3 days ago"
    },
    {
      id: "st-3",
      name: "Sneha Patel",
      email: "sneha.p@learnova.edu",
      course: "Cloud Architecture & Microservices",
      progress: 58,
      quizAvg: 48,
      status: "At-Risk",
      lastActive: "Yesterday"
    },
    {
      id: "st-4",
      name: "Priya Nair",
      email: "priya.nair@learnova.edu",
      course: "Machine Learning Foundations",
      progress: 88,
      quizAvg: 86,
      status: "Good",
      lastActive: "Today, 02:15 PM"
    },
    {
      id: "st-5",
      name: "Amit Sharma",
      email: "amit.sharma@learnova.edu",
      course: "Database Management Systems",
      progress: 62,
      quizAvg: 51,
      status: "Average",
      lastActive: "4 days ago"
    },
    {
      id: "st-6",
      name: "Ananya Iyer",
      email: "ananya.iyer@learnova.edu",
      course: "Cloud Architecture & Microservices",
      progress: 95,
      quizAvg: 98,
      status: "Good",
      lastActive: "Today, 09:12 AM"
    },
  ];

  const courses = [
    "All",
    "Database Management Systems",
    "Cloud Architecture & Microservices",
    "Machine Learning Foundations"
  ];

  const filteredStudents = studentRoster.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === "All" || st.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Learner Cohorts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Enrolled Students
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitor individual progress, diagnostic quiz scores, and identify students requiring remediation.
          </p>
        </div>

        <Link to="/faculty/ai-insights">
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600" />
            View At-Risk Diagnostics
          </Button>
        </Link>
      </div>

      {/* 4 Overview Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{studentRoster.length}</p>
          <span className="text-xs text-indigo-600 font-medium">Across active sections</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High Performers</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {studentRoster.filter((s) => s.status === "Good").length}
          </p>
          <span className="text-xs text-emerald-600 font-medium">&gt;85% completion & quizzes</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Needs Attention</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {studentRoster.filter((s) => s.status === "At-Risk").length}
          </p>
          <span className="text-xs text-red-500 font-medium">Low quiz score alert</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Progress</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">73.3%</p>
          <span className="text-xs text-slate-500 font-medium">Class curriculum rate</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Curriculum Progress</th>
                <th className="p-4">Quiz Avg</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={st.name} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900">{st.name}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {st.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-700 max-w-xs truncate">
                    {st.course}
                  </td>
                  <td className="p-4 min-w-36">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>{st.progress}%</span>
                      </div>
                      <ProgressBar value={st.progress} color={st.progress >= 70 ? "emerald" : st.progress >= 50 ? "indigo" : "amber"} />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    <span className={st.quizAvg < 50 ? "text-red-600 font-extrabold" : ""}>
                      {st.quizAvg}%
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={st.status === "Good" ? "success" : st.status === "At-Risk" ? "danger" : "warning"}>
                      {st.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">
                    {st.lastActive}
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/faculty/performance?studentId=${st.id}&name=${encodeURIComponent(st.name)}&course=${encodeURIComponent(st.course)}`}>
                      <Button variant="outline" size="sm">
                        View Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Students;
