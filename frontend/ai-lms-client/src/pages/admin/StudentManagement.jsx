import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { Users, Mail, Calendar, Trash2, Search, ShieldCheck } from "lucide-react";
import { Card, Badge, Avatar, EmptyState, Skeleton } from "../../components/common/UIPrimitives";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/Admin/users");
      const filtered = (res.data || []).filter((u) => u.role === "Student");
      setStudents(filtered);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this student account?")) return;
    try {
      await api.delete(`/Admin/users/${id}`);
      fetchStudents();
    } catch (err) {
      alert("Failed to delete student: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = students.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Learner Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Student Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            View, search, and manage registered student accounts across Learnova AI.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs font-semibold self-start sm:self-auto">
          Total Learners: <span className="font-bold text-indigo-600">{students.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search students by name or email..."
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
          icon={Users}
          title="No students found"
          description="Try adjusting your search query."
          actionText={searchTerm ? "Clear Search" : undefined}
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Learner</th>
                  <th className="p-4 whitespace-nowrap">Account Status</th>
                  <th className="p-4 whitespace-nowrap">Registered At</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name || "Student"} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-600" /> {s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="indigo" size="sm" icon={ShieldCheck}>
                        Active Student
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Active Member"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Delete Student Account"
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

export default StudentManagement;
