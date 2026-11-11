import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Users,
  Edit3,
  Trash2,
  ExternalLink,
  HelpCircle,
  Layers
} from "lucide-react";
import { Card, Badge, Button, Modal, Alert } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";

function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get("/Courses");
      if (Array.isArray(response.data)) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/Courses/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
      setActionMsg({ type: "success", text: "Course deleted successfully." });
    } catch (err) {
      setActionMsg({ type: "error", text: "Failed to delete course." });
    } finally {
      setDeleteCourseId(null);
      setTimeout(() => setActionMsg({ type: "", text: "" }), 3000);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Course Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Courses & Curriculum
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Create, edit, organize lessons, and manage assessments across all published courses.
          </p>
        </div>

        <Link to="/faculty/create-course">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Course
          </Button>
        </Link>
      </div>

      {actionMsg.text && (
        <Alert type={actionMsg.type === "success" ? "success" : "error"}>
          {actionMsg.text}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No courses found</h3>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search or create a new course.</p>
          <Link to="/faculty/create-course" className="inline-block mt-4">
            <Button variant="primary" size="sm">Create First Course</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col hover:border-slate-300 transition-all">
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={course.thumbnail || course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60";
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="indigo">{course.category || "CS"}</Badge>
                  <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {course.level || "All Levels"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {course.description || "Course curriculum designed with interactive lessons and AI-assisted practice."}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {course.chapters?.length || 4} Chapters
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {course.enrolledCount || 128} Students
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Link to={`/student/courses/${course.id}/learn`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview
                      </Button>
                    </Link>
                    <Link to="/faculty/quizzes">
                      <Button variant="ghost" size="sm" title="Manage Quizzes">
                        <HelpCircle className="w-4 h-4 text-slate-600" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCourseId(course.id)}
                      title="Delete Course"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCourseId && (
        <Modal
          isOpen={!!deleteCourseId}
          onClose={() => setDeleteCourseId(null)}
          title="Delete Course"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this course? This action cannot be undone and will remove all curriculum chapters.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteCourseId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteCourseId)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MyCourses;
