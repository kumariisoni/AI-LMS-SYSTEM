import { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Lock, CheckCircle2, GraduationCap, KeyRound } from "lucide-react";
import { Card, Badge, Button, Input, Avatar, Alert } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [savedMsg, setSavedMsg] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || "Student",
    email: user?.email || "",
    major: "Computer Science & Engineering",
    semester: "Semester 5 (Fall 2026)",
    weeklyGoalHours: 12
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: ""
  });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPassword) return;
    if (passwords.newPassword !== passwords.confirm) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPassMsg({ type: "success", text: "Security credentials updated successfully." });
    setPasswords({ current: "", newPassword: "", confirm: "" });
    setTimeout(() => setPassMsg({ type: "", text: "" }), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Account Settings & Profile
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Manage your personal information, academic targets, and security preferences.
        </p>
      </div>

      {savedMsg && (
        <Alert type="success">Profile changes saved successfully.</Alert>
      )}

      {/* 2. Personal Information Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 pb-6">
          <Avatar name={profile.name} size="xl" className="w-20 h-20 rounded-xl" />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
            <p className="text-xs font-semibold text-indigo-700">{profile.major}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
              <Badge variant="indigo" size="sm">Verified Student</Badge>
              <Badge variant="emerald" size="sm">Active Cohort</Badge>
              <span className="text-[11px] text-slate-400 font-medium">
                {profile.semester}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Email Address"
              value={profile.email}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
              helperText="Managed by university administration"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Major / Track"
              value={profile.major}
              onChange={(e) => setProfile({ ...profile, major: e.target.value })}
            />
            <Input
              label="Semester Cohort"
              value={profile.semester}
              onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Weekly Study Goal (Hours)"
              type="number"
              min="2"
              max="50"
              value={profile.weeklyGoalHours}
              onChange={(e) => setProfile({ ...profile, weeklyGoalHours: e.target.value })}
              helperText="Used to calibrate your AI-generated weekly roadmaps"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="primary" size="sm" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Security & Password Update Card */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            Security & Authentication
          </h3>
          <p className="text-xs text-slate-500">
            Keep your credentials secure with a strong password.
          </p>
        </div>

        {passMsg.text && (
          <Alert type={passMsg.type === "success" ? "success" : "error"}>
            {passMsg.text}
          </Alert>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
