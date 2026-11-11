import { useState } from "react";
import { User, Mail, ShieldCheck, Clock, BookOpen } from "lucide-react";
import { Card, Badge, Button, Input, Textarea, Avatar, Alert } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [savedMsg, setSavedMsg] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "Prof. Chetan Chudasma",
    email: user?.email || "chetan.chudasma@learnova.ai",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    experienceYears: "12",
    officeHours: "Mon/Wed 2:00 PM - 4:00 PM",
    bio: "Specialized in distributed systems, modern database architecture, and next-generation AI-assisted adaptive learning curricula."
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Faculty Profile & Credentials
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Academic credentials, department affiliation, and student consultation office hours.
        </p>
      </div>

      {savedMsg && (
        <Alert type="success">
          Profile changes and consultation hours saved successfully!
        </Alert>
      )}

      {/* Profile Overview Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 pb-6">
          <Avatar name={form.name} size="xl" className="w-20 h-20 rounded-xl" />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{form.name}</h2>
            <p className="text-xs font-semibold text-indigo-700">{form.designation} • {form.department}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
              <Badge variant="indigo" size="sm">Verified Faculty</Badge>
              <Badge variant="emerald" size="sm">Course Author</Badge>
              <span className="text-[11px] text-slate-400 font-medium">
                {form.experienceYears} Years Experience
              </span>
            </div>
          </div>
        </div>

        {/* Edit Details Form (2-col grid) */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Academic Email"
              value={form.email}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
              helperText="Managed by university administrator"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <Input
              label="Academic Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
          </div>

          <Input
            label="Student Consultation Office Hours"
            value={form.officeHours}
            onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
            placeholder="e.g. Mon/Wed 2:00 PM - 4:00 PM"
          />

          <Textarea
            label="Academic Biography"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="primary" size="sm" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
