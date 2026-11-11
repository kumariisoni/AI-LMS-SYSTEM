import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowRight,
  Zap,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { Card, Badge, Button, Modal, ProgressBar, Alert } from "../../components/common/UIPrimitives";

function AIInsights() {
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [alertSuccess, setAlertSuccess] = useState("");

  const weakTopics = [
    {
      topic: "Boyce-Codd Normal Form (BCNF)",
      course: "Database Management Systems",
      errorRate: 46,
      studentsAffected: 14,
      difficulty: "High",
      recommendation: "46% of learners struggled with decomposing non-trivial functional dependencies where determinant is not a superkey."
    },
    {
      topic: "B+ Tree Index Splitting & Leaf Pointers",
      course: "Database Management Systems",
      errorRate: 41,
      studentsAffected: 11,
      difficulty: "High",
      recommendation: "Learners conflated internal index node pointers with record RID leaf pointers."
    },
    {
      topic: "Two-Phase Commit (2PC) Distributed Consensus",
      course: "Cloud Architecture & Microservices",
      errorRate: 35,
      studentsAffected: 9,
      difficulty: "Medium",
      recommendation: "Confusion surrounding coordinator crash failure recovery during Prepare phase."
    },
  ];

  const atRiskStudents = [
    {
      name: "Rahul Verma",
      course: "Database Management Systems",
      quizScore: 42,
      lastActive: "3 days ago",
      flag: "Missed 2 remedial exercises"
    },
    {
      name: "Sneha Patel",
      course: "Cloud Architecture & Microservices",
      quizScore: 48,
      lastActive: "Yesterday",
      flag: "Struggling with Distributed Transactions"
    },
    {
      name: "Amit Sharma",
      course: "Database Management Systems",
      quizScore: 51,
      lastActive: "4 days ago",
      flag: "Incomplete assignment lab"
    },
  ];

  const handleGenerateRemedialQuiz = () => {
    setGeneratingQuiz(true);
    setTimeout(() => {
      setGeneratingQuiz(false);
      setGeneratedQuestions([
        {
          q: "Given relation R(A, B, C, D) with FDs {A -> B, B -> C, C -> D}. What is the highest normal form of R?",
          options: ["1NF", "2NF", "3NF", "BCNF"],
          ans: "2NF",
          explanation: "Candidate key is A. Functional dependency B -> C has non-prime attribute determining another non-prime attribute (transitive dependency), violating 3NF."
        },
        {
          q: "In a B+ Tree of order 4, what is the maximum number of keys an internal node can hold?",
          options: ["2", "3", "4", "5"],
          ans: "3",
          explanation: "An internal node in a B+ Tree of order p can hold at most p - 1 keys."
        },
        {
          q: "Which property distinguishes BCNF from 3NF?",
          options: [
            "In BCNF, every determinant must be a candidate/super key.",
            "BCNF allows partial dependencies on prime attributes.",
            "3NF requires lossy join decomposition.",
            "BCNF does not require 1NF."
          ],
          ans: "In BCNF, every determinant must be a candidate/super key.",
          explanation: "Unlike 3NF, BCNF does not permit the exception where the determined attribute is a prime attribute."
        }
      ]);
      setShowQuizModal(true);
    }, 1200);
  };

  const handlePublishQuiz = () => {
    setShowQuizModal(false);
    setAlertSuccess("Remedial quiz successfully published and assigned to at-risk students!");
    setTimeout(() => setAlertSuccess(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curriculum Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty AI Insights & Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Automated concept diagnosis, class-wide error detection, and personalized pedagogical intervention recommendations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerateRemedialQuiz}
          disabled={generatingQuiz}
        >
          {generatingQuiz ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Generate Remediation Quiz
            </>
          )}
        </Button>
      </div>

      {alertSuccess && (
        <Alert type="success">{alertSuccess}</Alert>
      )}

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">At-Risk Learners</span>
              <p className="text-3xl font-extrabold text-red-600 mt-1">3 Students</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-red-600/90 font-medium mt-2">Score &lt;50% on Chapter 3 & 4</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Weak Topic</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">BCNF Normalization</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2">46% class failure rate</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mastered Concept</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">Relational Algebra</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-2">91% overall class accuracy</p>
        </Card>
      </div>

      {/* Main Grid: Weak Topics vs At-Risk Student Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Common Weak Topics */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Class-Wide Diagnostic Error Rates
          </h2>

          <div className="space-y-4">
            {weakTopics.map((item, idx) => (
              <Card key={idx} className="p-5 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.topic}</h3>
                    <p className="text-xs text-slate-500">{item.course}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                      {item.errorRate}% Failure Rate
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Diagnostic Difficulty</span>
                    <span>{item.studentsAffected} students flagged</span>
                  </div>
                  <ProgressBar value={item.errorRate} color="red" />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-slate-800">Pedagogical Insight: </strong>
                    {item.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: At-Risk Watchlist & Actions */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                At-Risk Watchlist
              </h3>
              <Badge variant="danger">Active Alert</Badge>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map((st, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-900">{st.name}</p>
                    <span className="text-xs font-extrabold text-red-600">{st.quizScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{st.course}</p>
                  <p className="text-[10px] text-amber-600 font-semibold">{st.flag}</p>
                  <div className="pt-1 flex justify-end">
                    <Link to={`/faculty/performance?name=${encodeURIComponent(st.name)}&course=${encodeURIComponent(st.course)}`}>
                      <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View Diagnostics <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Recommendations */}
          <Card className="p-5 space-y-3 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Recommended Instructor Action
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Schedule a 20-minute review session addressing Normalization dependencies before next Monday&apos;s midterm assessment.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGenerateRemedialQuiz}
            >
              Generate AI Remedial Quiz
            </Button>
          </Card>
        </div>
      </div>

      {/* Generated Quiz Review Modal */}
      {showQuizModal && (
        <Modal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          title="AI-Generated Remedial Quiz (BCNF & Normalization)"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-500">
              Review questions formulated by Learnova AI targeting the exact failure patterns identified in Chapter 3 diagnostics.
            </p>

            <div className="space-y-4">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <p className="text-xs font-bold text-slate-900">
                    Q{idx + 1}. {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border text-[11px] ${
                          opt === q.ans
                            ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-800"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        {opt} {opt === q.ans && "✓ (Correct)"}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowQuizModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handlePublishQuiz}>
                Publish & Assign to At-Risk Students
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AIInsights;
