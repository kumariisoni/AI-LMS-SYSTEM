import { useState, useEffect } from "react";
import { UserCheck, Search, Award, CheckCircle2, Clock } from "lucide-react";
import api from "../../services/api";
import {
  Card,
  Badge,
  ProgressBar,
  Button,
  EmptyState,
  Avatar
} from "../../components/common/UIPrimitives";

export default function EnrollmentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/Courses/admin-enrollments");
        if (!isMounted) return;
        if (Array.isArray(res.data)) {
          setEnrollments(
            res.data.map((e) => ({
              id: e.id || e._id,
              studentName: e.studentName || "Student",
              studentEmail: e.studentEmail || "",
              courseTitle: e.courseTitle || "Course",
              progress: e.progressPercent || 0,
              status: e.status || "Active",
              enrolledDate: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "Recent"
            }))
          );
        }
      } catch (err) {
        console.warn("Failed to load admin enrollments:", err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEnrollments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleIssueCert = (id) => {
    alert(`Certificate record verified for enrollment ${id}!`);
  };

  const filtered = enrollments.filter(
    (e) =>
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Learner Cohorts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Enrollment Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track student course enrollments, active progress meters, and completion certificates.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs font-semibold self-start sm:self-auto">
          Active Enrollments: <span className="font-bold text-indigo-600">{enrollments.length}</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by student, email, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition-all shadow-2xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No enrollments found"
          description="Try adjusting your search criteria."
          actionText="Clear Search"
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Learner</th>
                  <th className="p-4 whitespace-nowrap">Course Title</th>
                  <th className="p-4 whitespace-nowrap">Progress</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Enrolled Date</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={e.studentName} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{e.studentName}</p>
                          <p className="text-[11px] text-slate-500">{e.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 max-w-xs truncate">
                      {e.courseTitle}
                    </td>
                    <td className="p-4 whitespace-nowrap w-44">
                      <ProgressBar
                        value={e.progress}
                        max={100}
                        showLabel
                        color={e.progress === 100 ? "emerald" : "indigo"}
                        height="h-2"
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge
                        variant={
                          e.status === "Completed"
                            ? "emerald"
                            : e.status === "Near Completion"
                            ? "amber"
                            : "indigo"
                        }
                        size="sm"
                        icon={e.status === "Completed" ? CheckCircle2 : Clock}
                      >
                        {e.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {e.enrolledDate}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {e.progress === 100 ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleIssueCert(e.id)}
                          icon={Award}
                        >
                          Certificate
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">In Progress</span>
                      )}
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
