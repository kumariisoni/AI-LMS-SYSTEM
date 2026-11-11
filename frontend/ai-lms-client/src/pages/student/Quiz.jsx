import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  ProgressBar
} from "../../components/common/UIPrimitives";

export default function Quiz() {
  const [topic, setTopic] = useState("DBMS Normalization (1NF, 2NF, 3NF, BCNF)");
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes

  // Countdown timer
  useEffect(() => {
    if (quizData && !submitted && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizData, submitted, timerSeconds]);

  const handleGenerateQuiz = async (selectedTopic) => {
    const targetTopic = selectedTopic || topic;
    setLoading(true);
    setSubmitted(false);
    setReviewMode(false);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimerSeconds(600);

    try {
      const res = await api.post("/ai/generate-quiz", { topic: targetTopic });
      if (res.data?.questions && res.data.questions.length > 0) {
        setQuizData(res.data);
      } else {
        throw new Error("No questions returned");
      }
    } catch {
      // Diagnostic course questions fallback
      setQuizData({
        topic: targetTopic,
        timeLimit: "10 minutes",
        questions: [
          {
            id: 1,
            question: "A relation is in Third Normal Form (3NF) if and only if:",
            options: [
              "It is in 2NF and has no transitive functional dependencies for non-prime attributes",
              "Every attribute is atomic and contains no multivalued groups",
              "It has no partial dependencies on any candidate key",
              "Every determinant is a superkey (BCNF condition)"
            ],
            correctIndex: 0,
            explanation: "3NF eliminates transitive dependencies (X → Y, Y → Z where Z is non-prime)."
          },
          {
            id: 2,
            question: "Which anomaly occurs when deleting certain data unintentionally removes other unrelated information?",
            options: [
              "Insertion Anomaly",
              "Deletion Anomaly",
              "Update Anomaly",
              "Normalization Leak"
            ],
            correctIndex: 1,
            explanation: "Deletion anomalies happen when data loss cascades to unassociated facts stored in the same row."
          },
          {
            id: 3,
            question: "Boyce-Codd Normal Form (BCNF) differs from 3NF primarily because:",
            options: [
              "BCNF requires that for every functional dependency X → Y, X must be a superkey",
              "BCNF allows composite keys with partial dependencies",
              "BCNF ignores non-prime attribute relationships",
              "BCNF is strictly weaker than 3NF"
            ],
            correctIndex: 0,
            explanation: "In BCNF, the left-hand side determinant X must always be a superkey without exception."
          },
          {
            id: 4,
            question: "What is the primary key requirement in First Normal Form (1NF)?",
            options: [
              "Each column must hold atomic (indivisible) values and each row must be uniquely identifiable",
              "All foreign keys must be explicitly declared",
              "No two columns may have the same data type",
              "Tables must have fewer than 10 attributes"
            ],
            correctIndex: 0,
            explanation: "1NF requires atomic attribute values and no repeating groups."
          },
          {
            id: 5,
            question: "A relation with candidate keys (A, B) and functional dependency B → C violates which normal form?",
            options: [
              "Second Normal Form (2NF) due to partial dependency",
              "First Normal Form (1NF)",
              "Fourth Normal Form (4NF)",
              "Domain Key Normal Form (DKNF)"
            ],
            correctIndex: 0,
            explanation: "Because C depends on a subset (B) of the candidate key (A, B), it violates 2NF."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const total = quizData?.questions?.length || 0;
  const currentQ = quizData?.questions?.[currentIndex];
  const score = calculateScore();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto pb-12">
      {/* Pre-Quiz Launch Card */}
      {!quizData && (
        <div className="space-y-6">
          <div className="border-b border-slate-200/80 pb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Adaptive Practice & Diagnostic Quizzes
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              AI-generated assessments calibrate questions to your knowledge profile.
            </p>
          </div>

          <Card className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Choose Assessment Subject
              </h2>
              <p className="text-xs text-slate-500">
                Type any curriculum topic or pick one from the quick select buttons.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. DBMS Normalization, React Server Components"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 h-10 px-3.5 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-600 transition-colors"
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => handleGenerateQuiz(topic)}
                loading={loading}
                icon={Sparkles}
              >
                Generate Quiz
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Quick Topics:</span>
              {[
                "DBMS Normalization",
                "React 19 Server Components",
                "Operating Systems Virtual Memory",
                "Computer Networks TCP/IP",
              ].map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => {
                    setTopic(top);
                    handleGenerateQuiz(top);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 cursor-pointer transition-colors"
                >
                  {top}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Active Distraction-Free Quiz UI (Step 23) */}
      {quizData && !submitted && (
        <div className="space-y-5">
          {/* Top Bar with Quiz Title, Question Step, Timer, and Progress Bar */}
          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  {quizData.topic}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Question {currentIndex + 1} of {total}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            <ProgressBar
              value={currentIndex + 1}
              max={total}
              height="h-1.5"
              color="indigo"
            />
          </Card>

          {/* Question Card */}
          <Card className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ?.question}
            </h3>

            {/* Options list */}
            <div className="space-y-2.5">
              {currentQ?.options?.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentIndex]: optIdx
                      })
                    }
                    className={`w-full p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-600 text-indigo-950 font-medium"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Previous & Next/Submit (Step 23) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                icon={ChevronLeft}
              >
                Previous
              </Button>

              {currentIndex < total - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setSubmitted(true)}
                  icon={CheckCircle2}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Result Screen */}
      {quizData && submitted && (
        <Card className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Quiz Completed!
            </h2>
            <p className="text-xs text-slate-500">
              Assessment results for {quizData.topic}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 inline-block mx-auto min-w-[200px]">
            <span className="text-3xl font-extrabold text-slate-900 block">
              {score} / {total}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Score: {percentage}%
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewMode(!reviewMode)}
            >
              {reviewMode ? "Hide Answers" : "Review Explanations"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateQuiz(topic)}
              icon={RotateCcw}
            >
              Retake Quiz
            </Button>
          </div>

          {/* Answer Review Section */}
          {reviewMode && (
            <div className="text-left space-y-4 pt-4 border-t border-slate-100">
              {quizData.questions.map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">
                        {qIdx + 1}. {q.question}
                      </p>
                      <Badge variant={isCorrect ? "emerald" : "red"} size="sm">
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>

                    <p className="text-slate-600">
                      <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                    </p>
                    <p className="text-slate-500 italic">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
