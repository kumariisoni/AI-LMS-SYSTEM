import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import aiService from "../../services/aiService";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  PlayCircle,
  HelpCircle,
  FileCode,
  GraduationCap,
  Loader2
} from "lucide-react";
import {
  Button,
  Card,
  Badge
} from "../../components/common/UIPrimitives";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [hasData, setHasData] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await aiService.getRecommendations();
        if (!isMounted) return;

        setHasData(Boolean(data?.hasData));
        setMessage(data?.message || "");
        setRecommendations(data?.recommendations || []);
      } catch (err) {
        console.warn("Failed to fetch recommendations:", err.message);
        if (!isMounted) return;
        setHasData(false);
        setMessage("Not enough learning data yet. Continue completing lessons and quizzes to receive personalized recommendations.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  const getIconForType = (type) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("quiz")) return HelpCircle;
    if (lower.includes("lesson")) return PlayCircle;
    if (lower.includes("lab") || lower.includes("practice")) return FileCode;
    return BookOpen;
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Recommended for You <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400" />
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Personalized learning recommendations powered by Gemini and grounded in your actual course progression.
        </p>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Analyzing your syllabus milestones with Gemini...
          </p>
        </div>
      ) : !hasData || recommendations.length === 0 ? (
        /* Empty / Insufficient Data State */
        <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Not Enough Learning Data Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {message || "Continue completing lessons and quizzes to receive personalized recommendations."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/courses">
              <Button variant="primary" size="sm">
                Explore Courses
              </Button>
            </Link>
            <Link to="/student/courses">
              <Button variant="secondary" size="sm">
                My Enrolled Courses
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Real Grounded Recommendations */
        <div className="space-y-6">
          {message && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => {
              const Icon = getIconForType(rec.type);
              const variant = rec.variant || "indigo";

              return (
                <Card
                  key={i}
                  className="p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all bg-white"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={variant} size="sm">
                        {rec.type || "Recommended Track"}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">
                        {rec.duration || "Self-paced"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link to={rec.link || "/student/courses"}>
                      <Button variant="outline" size="sm" icon={ArrowRight}>
                        Open Track
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
