import { useState } from "react";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Users,
  Trash2
} from "lucide-react";
import { Card, Badge, Button, Input, Modal, Alert } from "../../components/common/UIPrimitives";

function Assignments() {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [assignments, setAssignments] = useState([
    {
      id: "asg-1",
      title: "Lab Assignment 1: B+ Tree Index File Implementation",
      course: "Database Management Systems",
      dueDate: "Oct 05, 2026",
      maxMarks: 50,
      totalSubmissions: 38,
      pendingGrading: 6,
      status: "Active"
    },
    {
      id: "asg-2",
      title: "Lab Assignment 2: Relational Normalization & BCNF Decomposition",
      course: "Database Management Systems",
      dueDate: "Oct 12, 2026",
      maxMarks: 50,
      totalSubmissions: 24,
      pendingGrading: 24,
      status: "Active"
    },
    {
      id: "asg-3",
      title: "Microservices Deployment with Kubernetes Helm Charts",
      course: "Cloud Architecture & Microservices",
      dueDate: "Sep 28, 2026",
      maxMarks: 100,
      totalSubmissions: 42,
      pendingGrading: 0,
      status: "Graded"
    },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    course: "Database Management Systems",
    dueDate: "",
    maxMarks: 50,
    instructions: ""
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;

    const created = {
      id: `asg-${Date.now()}`,
      title: newAssignment.title,
      course: newAssignment.course,
      dueDate: newAssignment.dueDate || "Oct 20, 2026",
      maxMarks: Number(newAssignment.maxMarks) || 50,
      totalSubmissions: 0,
      pendingGrading: 0,
      status: "Active"
    };

    setAssignments([created, ...assignments]);
    setShowCreateModal(false);
    setAlertMsg("Assignment published successfully to course enrolled students!");
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleDelete = (id) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === "All" || a.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Coursework Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Course Assignments & Projects
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Publish coding assignments, track submissions, evaluate student work, and upload rubric criteria.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create Assignment
        </Button>
      </div>

      {alertMsg && <Alert type="success">{alertMsg}</Alert>}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Assignments</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{assignments.length}</p>
          <span className="text-xs text-indigo-600 font-medium">Ongoing coursework</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {assignments.reduce((acc, a) => acc + a.totalSubmissions, 0)}
          </p>
          <span className="text-xs text-slate-500 font-medium">Uploaded deliverables</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Grading</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {assignments.reduce((acc, a) => acc + a.pendingGrading, 0)}
          </p>
          <span className="text-xs text-amber-600 font-medium">Requires evaluation</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {assignments.filter((a) => a.status === "Graded").length}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Fully evaluated</span>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments..."
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

      {/* Assignment List */}
      <div className="space-y-3">
        {filteredAssignments.map((asg) => (
          <Card key={asg.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="indigo">{asg.course}</Badge>
                <Badge variant={asg.status === "Active" ? "primary" : "success"}>
                  {asg.status}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">{asg.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: {asg.dueDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {asg.totalSubmissions} Submissions
                </span>
                <span className="text-slate-600 font-semibold">
                  Max Marks: {asg.maxMarks}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
              {asg.pendingGrading > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-sm font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                    {asg.pendingGrading} to grade
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Submissions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(asg.id)}
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

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Assignment"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
              <Input
                placeholder="e.g. Lab 4: Distributed Deadlock Detection Algorithm"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Course</label>
                <select
                  value={newAssignment.course}
                  onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Cloud Architecture & Microservices">Cloud Architecture & Microservices</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Score</label>
              <Input
                type="number"
                min="10"
                max="100"
                value={newAssignment.maxMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions & Rubrics</label>
              <textarea
                rows={4}
                value={newAssignment.instructions}
                onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                placeholder="Specify submission guidelines, file formats (.zip, .pdf), and evaluation criteria..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Publish Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Assignments;
