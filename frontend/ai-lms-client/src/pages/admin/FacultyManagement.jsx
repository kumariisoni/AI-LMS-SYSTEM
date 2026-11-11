import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  GraduationCap,
  Plus,
  Trash2,
  Mail,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Search
} from "lucide-react";
import {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  Alert,
  EmptyState,
  Skeleton
} from "../../components/common/UIPrimitives";
import FacultyAvatar from "../../components/common/FacultyAvatar";

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const [facultyForm, setFacultyForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    experienceYears: 3,
    bio: "",
    subjects: "",
    officeHours: "",
  });

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Admin/faculty");
      setFaculty(res.data || []);
    } catch (err) {
      console.error("Failed to load faculty:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

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
      setFormMsg({
        type: "success",
        text: res.data?.message || "Faculty credentials provisioned successfully!"
      });

      setTimeout(() => {
        setShowCreateModal(false);
        setFacultyForm({
          name: "",
          email: "",
          password: "",
          department: "",
          designation: "",
          experienceYears: 3,
          bio: "",
          subjects: "",
          officeHours: "",
        });
        setFormMsg({ type: "", text: "" });
        fetchFaculty();
      }, 1200);
    } catch (err) {
      setFormMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to provision faculty."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this faculty account?")) return;
    try {
      await api.delete(`/Admin/users/${userId}`);
      fetchFaculty();
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = faculty.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.name?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term) ||
      f.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Academic Staff</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Faculty Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Create faculty login credentials, manage academic profiles, and monitor curriculum coverage.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Create Faculty Account
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search faculty by name, email, or department..."
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
          icon={GraduationCap}
          title="No faculty accounts found"
          description={
            searchTerm
              ? "No faculty match your search criteria."
              : "Click Create Faculty Account above to provision a new faculty profile."
          }
          actionText={searchTerm ? "Clear Search" : "Create Faculty Account"}
          onAction={() => (searchTerm ? setSearchTerm("") : setShowCreateModal(true))}
        />
      ) : (
        <Card className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Faculty Member</th>
                  <th className="p-4 whitespace-nowrap">Department & Designation</th>
                  <th className="p-4 whitespace-nowrap">Experience & Subjects</th>
                  <th className="p-4 whitespace-nowrap">Office Hours</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((f) => (
                  <tr key={f.id || f.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FacultyAvatar name={f.name || "Faculty"} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-600" /> {f.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="indigo" size="sm">
                        {f.designation || "Faculty"}
                      </Badge>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">{f.department}</p>
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{f.experienceYears || 0} Years Exp.</p>
                      {f.subjects && f.subjects.length > 0 && (
                        <p className="text-slate-500 text-[11px] mt-0.5 max-w-xs truncate">
                          {f.subjects.join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{f.officeHours || "By appointment"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(f.userId)}
                        title="Delete Faculty Account"
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

      {/* Create Faculty Credentials Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Faculty Credentials"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          {formMsg.text && (
            <Alert type={formMsg.type === "success" ? "success" : "error"}>
              {formMsg.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              name="name"
              required
              placeholder="e.g. Dr. Rajesh Kumar"
              value={facultyForm.name}
              onChange={handleFormChange}
            />
            <Input
              label="Official Email *"
              name="email"
              type="email"
              required
              placeholder="rajesh.kumar@learnova.ai"
              value={facultyForm.email}
              onChange={handleFormChange}
            />
          </div>

          <Input
            label="Temporary Password *"
            name="password"
            type="password"
            required
            placeholder="At least 6 characters"
            value={facultyForm.password}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department *"
              name="department"
              required
              placeholder="Computer Science"
              value={facultyForm.department}
              onChange={handleFormChange}
            />
            <Input
              label="Designation *"
              name="designation"
              required
              placeholder="Associate Professor"
              value={facultyForm.designation}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Experience (Years)"
              name="experienceYears"
              type="number"
              min="0"
              placeholder="3"
              value={facultyForm.experienceYears}
              onChange={handleFormChange}
            />
            <Input
              label="Office Hours"
              name="officeHours"
              placeholder="Mon-Thu 2:00 - 4:00 PM"
              value={facultyForm.officeHours}
              onChange={handleFormChange}
            />
          </div>

          <Input
            label="Subjects / Specializations (Comma-separated)"
            name="subjects"
            placeholder="DBMS, Machine Learning, Data Structures"
            value={facultyForm.subjects}
            onChange={handleFormChange}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Biography & Research Focus
            </label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Brief professional profile and academic credentials..."
              value={facultyForm.bio}
              onChange={handleFormChange}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
