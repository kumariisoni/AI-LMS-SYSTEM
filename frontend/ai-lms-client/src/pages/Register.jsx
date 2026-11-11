import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { ArrowLeft, User, Mail, Lock, ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import { Button, Input, Card, Alert } from "../components/common/UIPrimitives";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-time password criteria evaluation
  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[@#$%!&*_\-+=~^()[\]{}|:;"'<>,.?/\\`]/.test(password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear previous error upon editing
    if (error) setError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required.");
      return;
    }

    if (!hasMinLength) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!hasUppercase) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!hasDigit) {
      setError("Password must contain at least one digit.");
      return;
    }

    if (!hasSpecial) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      // Backend automatically forces Role = "Student"
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const data = await registerUser(payload);
      setMessage(data.message || "Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const serverMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.title;

      setError(
        serverMsg || (err.message?.includes("Network Error")
          ? "Unable to reach the server. Please verify the backend API is running on port 5291."
          : "Registration failed. Please check your connection or try another email.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between py-10 px-4 sm:px-6">
      {/* Top Floating Pill Back Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Student Registration
        </span>
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-md mx-auto">
        <Card className="p-8 sm:p-9 border-slate-200 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 group mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-105">
                <img
                  src="/learnova-icon.png"
                  alt="AI-LMS"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Learnova
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  AI
                </span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Join thousands of students learning smarter with AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              id="register-name"
              icon={User}
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email address"
              type="email"
              name="email"
              id="register-email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type="password"
                name="password"
                id="register-password"
                icon={Lock}
                placeholder="Min. 8 chars, 1 uppercase, 1 digit, 1 special"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                <p className="font-semibold text-slate-700 pb-0.5">Password requirements:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-500">
                  <span className={`inline-flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : ""}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <Circle className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    At least 8 characters
                  </span>
                  <span className={`inline-flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-semibold" : ""}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <Circle className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    One uppercase (A-Z)
                  </span>
                  <span className={`inline-flex items-center gap-1.5 ${hasDigit ? "text-emerald-700 font-semibold" : ""}`}>
                    {hasDigit ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <Circle className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    One number (0-9)
                  </span>
                  <span className={`inline-flex items-center gap-1.5 ${hasSpecial ? "text-emerald-700 font-semibold" : ""}`}>
                    {hasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <Circle className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    One special (@, #, $, etc.)
                  </span>
                </div>
              </div>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              id="register-confirm-password"
              icon={Lock}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <Alert type="error" className="py-2.5">
                {error}
              </Alert>
            )}

            {message && (
              <Alert type="success" className="py-2.5">
                {message}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-xs">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </Card>
      </div>

      <div className="text-center text-slate-400 text-xs">
        © 2026 Learnova AI. All rights reserved.
      </div>
    </div>
  );
}

export default Register;
