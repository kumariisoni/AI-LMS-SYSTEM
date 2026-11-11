import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  PlusCircle,
  Search,
  Filter,
  Users,
  Clock,
  Trash2,
  Layers,
  Plus
} from "lucide-react";
import { Card, Badge, Button, Input, Modal, Alert } from "../../components/common/UIPrimitives";

function ManageQuizzes() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [quizzes, setQuizzes] = useState([
    {
      id: "qz-1",
      title: "Quiz 1: SQL Fundamentals & Data Definition",
      course: "Database Management Systems",
      questionsCount: 10,
      timeLimit: "15 mins",
      attempts: 42,
      avgScore: 84,
      status: "Published"
    },
    {
      id: "qz-2",
      title: "Quiz 2: Relational Calculus & Query Optimization",
      course: "Database Management Systems",
      questionsCount: 12,
      timeLimit: "20 mins",
      attempts: 38,
      avgScore: 71,
      status: "Published"
    },
    {
      id: "qz-3",
      title: "Quiz 3: Normalization & BCNF Decomposition",
      course: "Database Management Systems",
      questionsCount: 15,
      timeLimit: "25 mins",
      attempts: 35,
      avgScore: 46,
      status: "Published"
    },
    {
      id: "qz-4",
      title: "Cloud Native Principles & 12-Factor Apps",
      course: "Cloud Architecture & Microservices",
      questionsCount: 10,
      timeLimit: "15 mins",
      attempts: 29,
      avgScore: 88,
      status: "Published"
    },
  ]);

  const [newQuiz, setNewQuiz] = useState({
    title: "",
    course: "Database Management Systems",
    timeLimit: 15,
    passingScore: 60,
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0
      }
    ]
  });

  const handleAddQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0
        }
      ]
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newQuiz.title.trim()) return;

    const created = {
      id: `qz-${Date.now()}`,
      title: newQuiz.title,
      course: newQuiz.course,
      questionsCount: newQuiz.questions.length,
      timeLimit: `${newQuiz.timeLimit} mins`,
      attempts: 0,
      avgScore: 0,
      status: "Published"
    };

    setQuizzes([created, ...quizzes]);
    setShowCreateModal(false);
    setAlertMsg("Assessment created and published to students!");
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleDelete = (id) => {
    setQuizzes(quizzes.filter((q) => q.id !== id));
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === "All" || q.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assessments Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quizzes & Assessments
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Build diagnostic quizzes, review test metrics, configure auto-evaluation, and identify learning hurdles.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create New Quiz
        </Button>
      </div>

      {alertMsg && <Alert type="success">{alertMsg}</Alert>}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Quizzes</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{quizzes.length}</p>
          <span className="text-xs text-indigo-600 font-medium">Auto-graded</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {quizzes.reduce((acc, q) => acc + q.attempts, 0)}
          </p>
          <span className="text-xs text-slate-500 font-medium">Student attempts</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Pass Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">79.2%</p>
          <span className="text-xs text-emerald-600 font-medium">&gt;60% threshold</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flagged Questions</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">5</p>
          <span className="text-xs text-amber-600 font-medium">High error rate</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title..."
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
            <option value="All">All Courses</option>
            <option value="Database Management Systems">Database Management Systems</option>
            <option value="Cloud Architecture & Microservices">Cloud Architecture & Microservices</option>
          </select>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="space-y-3">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="indigo">{quiz.course}</Badge>
                <Badge variant={quiz.status === "Published" ? "success" : "default"}>
                  {quiz.status}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">{quiz.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {quiz.questionsCount} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {quiz.timeLimit}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {quiz.attempts} Attempts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Score</span>
                <span className={`text-base font-extrabold ${quiz.avgScore < 50 ? "text-red-600" : "text-slate-900"}`}>
                  {quiz.avgScore}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/student/quizzes">
                  <Button variant="outline" size="sm">Preview</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(quiz.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Diagnostic Quiz"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title *</label>
              <Input
                placeholder="e.g. Chapter 4: Concurrency Control & Deadlocks"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Course</label>
                <select
                  value={newQuiz.course}
                  onChange={(e) => setNewQuiz({ ...newQuiz, course: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Cloud Architecture & Microservices">Cloud Architecture & Microservices</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (Mins)</label>
                <Input
                  type="number"
                  min="5"
                  value={newQuiz.timeLimit}
                  onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: e.target.value })}
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Questions ({newQuiz.questions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              {newQuiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-600">Question {qIdx + 1}</span>
                  </div>
                  <Input
                    placeholder="Enter question text..."
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...newQuiz.questions];
                      updated[qIdx].questionText = e.target.value;
                      setNewQuiz({ ...newQuiz, questions: updated });
                    }}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctOption === oIdx}
                          onChange={() => {
                            const updated = [...newQuiz.questions];
                            updated[qIdx].correctOption = oIdx;
                            setNewQuiz({ ...newQuiz, questions: updated });
                          }}
                          className="accent-indigo-600"
                        />
                        <Input
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQuiz.questions];
                            updated[qIdx].options[oIdx] = e.target.value;
                            setNewQuiz({ ...newQuiz, questions: updated });
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Publish Assessment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageQuizzes;
