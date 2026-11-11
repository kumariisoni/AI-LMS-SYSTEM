import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  ProgressBar
} from "../../components/common/UIPrimitives";

export default function StudyPlan() {
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      day: "MON",
      fullDay: "Monday",
      subject: "DBMS — Normalization",
      topic: "1NF, 2NF, 3NF & Transitive Dependencies",
      duration: "60 min",
      type: "Course Lecture & Practice",
      completed: true,
    },
    {
      id: 2,
      day: "TUE",
      fullDay: "Tuesday",
      subject: "Operating Systems — Processes",
      topic: "Process Synchronization & Semaphore Primitives",
      duration: "45 min",
      type: "Video & Guided Code",
      completed: true,
    },
    {
      id: 3,
      day: "WED",
      fullDay: "Wednesday",
      subject: "Practice Quiz",
      topic: "Diagnostic Normalization & Decomposition Quiz",
      duration: "30 min",
      type: "AI Assessment",
      completed: true,
    },
    {
      id: 4,
      day: "THU",
      fullDay: "Thursday",
      subject: "Full Stack — Vector Search",
      topic: "MongoDB Atlas Vector Search with LangChain",
      duration: "60 min",
      type: "Hands-on Lab",
      completed: false,
    },
    {
      id: 5,
      day: "FRI",
      fullDay: "Friday",
      subject: "Weekly Review & Milestone",
      topic: "Comprehensive review of weak-topic progress",
      duration: "45 min",
      type: "Review Session",
      completed: false,
    },
  ]);

  const toggleTask = (id) => {
    setSchedule(schedule.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const completedCount = schedule.filter((s) => s.completed).length;
  const goalPercentage = Math.round((completedCount / schedule.length) * 100);

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>AI Adaptive Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Personalized Study Plan
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Structured study schedule dynamically generated based on your weak areas and target exam dates.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={Sparkles}>
          Recalculate Plan
        </Button>
      </div>

      {/* Weekly Goal Progress Bar Card (Section 25) */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Weekly Goal Progress</h2>
          </div>
          <span className="text-sm font-extrabold text-indigo-600">{goalPercentage}% Completed</span>
        </div>
        <ProgressBar value={goalPercentage} max={100} color="indigo" height="h-3" />
        <p className="text-xs text-slate-500 mt-2">
          {completedCount} of {schedule.length} scheduled study sessions checked off this week. Keep going!
        </p>
      </Card>

      {/* Timeline Schedule: THIS WEEK */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            THIS WEEK
          </h2>
          <span className="text-xs text-slate-400">5 Sessions • 4.0 Hours</span>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTask(item.id)}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                item.completed
                  ? "bg-slate-50/80 border-slate-200 opacity-75"
                  : "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                    item.completed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}
                >
                  <span className="text-[10px] uppercase">{item.day}</span>
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                  ) : (
                    <span className="text-xs font-black">●</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        item.completed ? "line-through text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {item.subject}
                    </h3>
                    <Badge variant={item.completed ? "slate" : "indigo"} size="sm">
                      {item.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.topic}</p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
