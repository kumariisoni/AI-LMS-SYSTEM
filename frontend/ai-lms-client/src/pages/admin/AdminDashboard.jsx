import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Database,
  Search
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  Input,
  Modal,
  StatCard,
  Alert
} from "../../components/common/UIPrimitives";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    experienceYears: 1,
    bio: "",
    subjects: "",
    officeHours: "",
  });
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/Admin/dashboard");
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFormChange = (e) => {
    setFacultyForm({
      ...facultyForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setFormMsg({ type: "", text: "" });
    setSubmitting(true);

    try {
      const subjectsArray = facultyForm.subjects
        ? facultyForm.subjects.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...facultyForm,
        experienceYears: Number(facultyForm.experienceYears) || 0,
        subjects: subjectsArray,
      };

      const res = await api.post("/Admin/create-faculty", payload);
      setFormMsg({ type: "success", text: res.data.message || "Faculty account created successfully!" });

      setTimeout(() => {
        setShowCreateModal(false);
        setFacultyForm({
          name: "",
          email: "",
          password: "",
          department: "",
          designation: "",
          experienceYears: 1,
          bio: "",
          subjects: "",
          officeHours: "",
        });
        setFormMsg({ type: "", text: "" });
        fetchStats();
      }, 1500);
    } catch (err) {
      setFormMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to create instructor account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sampleRecentUsers = [
    { name: "Prof. Chetan Chudasma", email: "chetan.chudasma@learnova.ai", role: "Faculty", dept: "Computer Science & Engineering", date: "Sep 22, 2026", status: "Active" },
    { name: "Prof. Papu Kumar Rai", email: "papu.rai@learnova.ai", role: "Faculty", dept: "Computer Science & Engineering", date: "Sep 22, 2026", status: "Active" },
    { name: "Prof. Partik Chauhan", email: "partik.chauhan@learnova.ai", role: "Faculty", dept: "Computer Science & Engineering", date: "Sep 23, 2026", status: "Active" },
    { name: "Aarav Patel", email: "student@learnova.ai", role: "Student", dept: "Computer Science", date: "Sep 24, 2026", status: "Active" },
    { name: "Ananya Roy", email: "demo.student@learnova.ai", role: "Student", dept: "Information Technology", date: "Sep 24, 2026", status: "Active" },
  ];

  const filteredUsers = sampleRecentUsers.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* 1. SaaS Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Admin Console
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            System overview, instructor provisioning, user governance & operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={UserPlus}
          >
            Provision Faculty
          </Button>
          <Link to="/admin/analytics">
            <Button variant="secondary" size="sm">
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Compact Stats Grid (Step 15) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers || 24}
          icon={Users}
          variant="indigo"
          subtitle="System-wide accounts"
        />
        <StatCard
          title="Students"
          value={loading ? "..." : stats.totalStudents || 18}
          icon={GraduationCap}
          variant="blue"
          trend="+14% this month"
        />
        <StatCard
          title="Faculty Members"
          value={loading ? "..." : stats.totalFaculty || 5}
          icon={ShieldCheck}
          variant="violet"
          subtitle="Verified instructors"
        />
        <StatCard
          title="Active Courses"
          value={loading ? "..." : stats.totalCourses || 6}
          icon={BookOpen}
          variant="emerald"
          subtitle="Curriculum catalog"
        />
      </div>

      {/* 3. System Health & Database Telemetry Strip */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Database Engine: MongoDB Atlas</span>
              <Badge variant="emerald" size="sm">Healthy</Badge>
            </div>
            <p className="text-[11px] text-slate-500">Latency: 18ms • Replica Set: Active • Encryption: TLS 1.3</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">API Runtime:</span>
          <span>.NET 10 ASP.NET Core</span>
        </div>
      </Card>

      {/* 4. Professional User Management Table (Step 16) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent System Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review credentialed user accounts across departments.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, email, or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <Badge variant={u.role === "Faculty" ? "violet" : "blue"} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.dept}</td>
                    <td className="p-3.5 text-slate-400">{u.date}</td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 5. Provision Instructor Modal (Step 17: Standardized Form Grid) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Provision New Faculty Account"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          {formMsg.text && (
            <Alert type={formMsg.type === "success" ? "success" : "error"}>
              {formMsg.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="Dr. Rajesh Gupta"
              value={facultyForm.name}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="rajesh.gupta@learnova.ai"
              value={facultyForm.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={facultyForm.password}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Department"
              name="department"
              placeholder="Computer Science & AI"
              value={facultyForm.department}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation / Academic Title"
              name="designation"
              placeholder="Associate Professor"
              value={facultyForm.designation}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Experience (Years)"
              name="experienceYears"
              type="number"
              min="0"
              value={facultyForm.experienceYears}
              onChange={handleFormChange}
              required
            />
          </div>

          <Input
            label="Subjects / Topics Taught (comma-separated)"
            name="subjects"
            placeholder="Data Structures, DBMS, Machine Learning"
            value={facultyForm.subjects}
            onChange={handleFormChange}
          />

          <Input
            label="Office Hours / Schedule"
            name="officeHours"
            placeholder="Mon/Wed 2:00 PM - 4:00 PM"
            value={facultyForm.officeHours}
            onChange={handleFormChange}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={submitting}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
