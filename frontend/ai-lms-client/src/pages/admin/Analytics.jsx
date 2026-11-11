import { BarChart3, TrendingUp, Users, Brain, Zap, Clock } from "lucide-react";
import { Card, StatCard, ProgressBar, Badge } from "../../components/common/UIPrimitives";

export default function Analytics() {
  const popularCourses = [
    { name: "Full Stack Web & AI Development", learners: 4820, percent: 92 },
    { name: "Modern React 19 & Next.js Architecture", learners: 3750, percent: 84 },
    { name: "Generative AI & LLM Agent Architecture", learners: 3120, percent: 76 },
    { name: "Enterprise Cloud Architecture on AWS", learners: 2890, percent: 68 },
    { name: "UI/UX Design Mastery & Figma Systems", learners: 2310, percent: 55 },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Platform Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            System & Learning Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time platform activity metrics, user engagement trends, and database telemetry.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-indigo-600" /> Live Data Feed
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Daily Learners"
          value="2,840"
          subtitle="+14.2% vs last week"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="Course Completion Rate"
          value="87.4%"
          subtitle="+4.1% platform avg"
          icon={TrendingUp}
          variant="emerald"
        />
        <StatCard
          title="AI Tutor Inquiries"
          value="18,490"
          subtitle="Real-time LLM chats"
          icon={Brain}
          variant="violet"
        />
        <StatCard
          title="Database Query Latency"
          value="1.8 ms"
          subtitle="WiredTiger avg response"
          icon={Zap}
          variant="blue"
        />
      </div>

      {/* Popular Tracks Breakdown */}
      <Card className="p-6 bg-white space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Highest Engagement Academic Tracks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated based on active lesson progress and quiz completions</p>
          </div>
          <Badge variant="indigo" size="sm">Top 5</Badge>
        </div>

        <div className="space-y-4 pt-1">
          {popularCourses.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">{c.name}</span>
                <span className="text-slate-500">{c.learners.toLocaleString()} learners ({c.percent}%)</span>
              </div>
              <ProgressBar
                value={c.percent}
                max={100}
                color={c.percent > 80 ? "indigo" : "blue"}
                height="h-2"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
