import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { BookOpen, Search, Trash2, Star, Users } from "lucide-react";
import { Card, Badge, EmptyState, Skeleton } from "../../components/common/UIPrimitives";

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Courses");
      setCourses(res.data || []);
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
    if (!window.confirm("Are you sure you want to remove this course?")) return;
    try {
      await api.delete(`/Courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert("Failed to delete course: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = courses.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.title || c.name)?.toLowerCase().includes(term) ||
      (c.instructorName || c.instructor)?.toLowerCase().includes(term) ||
      c.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curriculum Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Course Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            System-wide course catalog, curriculum status, pricing, and enrollments across Learnova AI.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs font-semibold self-start sm:self-auto">
          Active Courses: <span className="font-bold text-indigo-600">{courses.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by title, instructor, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all shadow-2xs"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search criteria."
          actionText={searchTerm ? "Clear Search" : undefined}
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Course</th>
                  <th className="p-4 whitespace-nowrap">Faculty</th>
                  <th className="p-4 whitespace-nowrap">Category & Level</th>
                  <th className="p-4 whitespace-nowrap">Price</th>
                  <th className="p-4 whitespace-nowrap">Students</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {(c.thumbnailUrl || c.thumbnail || c.image) && (
                          <img
                            src={c.thumbnailUrl || c.thumbnail || c.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm max-w-xs truncate">
                            {c.title || c.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-0.5 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{c.rating || "4.8"} rating</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 whitespace-nowrap">
                      {c.instructorName || c.instructor || "Faculty"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="indigo" size="sm">
                        {c.category || "Development"}
                      </Badge>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{c.level || "Intermediate"}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-slate-900">
                      {c.price === 0 || !c.price ? (
                        <span className="text-emerald-700">Free</span>
                      ) : (
                        `₹${c.price?.toLocaleString("en-IN")}`
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{(c.enrolledStudents || c.enrolledCount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(c.id || c._id)}
                        title="Delete Course"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
