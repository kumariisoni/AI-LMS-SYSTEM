import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  TrendingUp,
  ArrowLeft,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Calendar,
  Layers
} from "lucide-react";
import { Card, Badge, Button, Avatar, ProgressBar, Alert } from "../../components/common/UIPrimitives";

function StudentPerformance() {
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get("name") || "Rahul Verma";
  const courseName = searchParams.get("course") || "Database Management Systems";

  const [message, setMessage] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const topicBreakdown = [
    { topic: "Relational Algebra & Calculus", score: 85, status: "Strong" },
    { topic: "SQL DDL & Complex Joins", score: 72, status: "Moderate" },
    { topic: "Transactions & ACID Properties", score: 68, status: "Moderate" },
    { topic: "Normalization (1NF to BCNF)", score: 42, status: "Weak" },
    { topic: "B+ Tree Index Traversals", score: 38, status: "Weak" },
  ];

  const quizHistory = [
    { title: "Quiz 1: SQL Basics", score: 82, date: "Sep 12, 2026", status: "Passed" },
    { title: "Quiz 2: Relational Design", score: 70, date: "Sep 18, 2026", status: "Passed" },
    { title: "Quiz 3: Normalization & Functional Dependency", score: 42, date: "Sep 24, 2026", status: "Failed" },
  ];

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setFeedbackSent(true);
    setMessage("");
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link to="/faculty/students" className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{studentName}</h1>
              <Badge variant="danger">At-Risk Alert</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Enrolled in <span className="font-semibold text-slate-700">{courseName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/faculty/students">
            <Button variant="outline" size="sm">Back to Roster</Button>
          </Link>
        </div>
      </div>

      {feedbackSent && (
        <Alert type="success">
          Personalized guidance and recommended study materials sent directly to {studentName}.
        </Alert>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Progress</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">45%</p>
          <ProgressBar value={45} color="amber" className="mt-2" />
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Avg</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">42%</p>
          <span className="text-xs text-red-500 font-medium">Below 50% passing line</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Completed</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">3 / 5</p>
          <span className="text-xs text-slate-500 font-medium">1 test overdue</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Grade</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">C-</p>
          <span className="text-xs text-amber-600 font-medium">AI projected semester</span>
        </Card>
      </div>

      {/* Main Analysis: AI Diagnostics & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Diagnostics & Topic Mastery */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Diagnostic Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-amber-50/60 to-orange-50/40 border-amber-200">
            <div className="flex items-center gap-2 mb-2 text-amber-900 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Learnova AI Student Diagnostic Summary</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Critical Difficulty with Normalization & Indexing Concepts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Student answered 4 out of 5 questions incorrectly regarding Boyce-Codd Normal Form (BCNF) decomposition and secondary index B-Tree search depth.
              The student appears to comprehend primary keys and Basic SQL queries, but struggles when multi-valued dependencies are introduced.
            </p>
          </Card>

          {/* Topic-by-Topic Mastery */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Topic-by-Topic Competency Breakdown
            </h3>

            <div className="space-y-3.5">
              {topicBreakdown.map((t, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{t.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{t.score}%</span>
                      <Badge variant={t.status === "Strong" ? "success" : t.status === "Moderate" ? "default" : "danger"}>
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar
                    value={t.score}
                    color={t.score >= 75 ? "emerald" : t.score >= 60 ? "indigo" : "red"}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Assessment History */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Assessment History
            </h3>

            <div className="space-y-2">
              {quizHistory.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{q.title}</p>
                    <p className="text-[10px] text-slate-400">{q.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${q.score < 50 ? "text-red-600" : "text-slate-800"}`}>
                      {q.score}%
                    </span>
                    <Badge variant={q.status === "Passed" ? "success" : "danger"}>
                      {q.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Instructor Recommended Interventions & Message */}
        <div className="space-y-6">
          {/* AI Recommended Next Steps */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Recommended Interventions
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                <p className="font-bold text-indigo-900">1. Assign Normalization Remediation Module</p>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Learnova AI has bundled 3 practice questions with step-by-step breakdown.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">2. Invite to TA Office Hours</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Encourage joining Friday 3 PM live discussion for B-Tree indexes.
                </p>
              </div>
            </div>
          </Card>

          {/* Direct Feedback Form */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Send Student Feedback & Note
            </h3>
            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${studentName}, I noticed you had trouble on the Chapter 3 Normalization test. Please review the attached notes...`}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
              <Button variant="primary" size="sm" type="submit" className="w-full">
                <Send className="w-3.5 h-3.5 mr-1.5" /> Send Guidance to Student
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentPerformance;
