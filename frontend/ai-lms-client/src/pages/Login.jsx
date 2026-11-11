import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Button, Input, Card, Alert } from "../components/common/UIPrimitives";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e, customData) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    const dataToSubmit = customData || formData;

    if (!dataToSubmit.email || !dataToSubmit.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(dataToSubmit);
      const token = data.token;

      // Decode JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));

      const userData = {
        id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        name: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      };

      login(userData, token);

      // Redirect strictly according to backend-verified role
      if (userData.role === "Admin") {
        navigate("/admin");
      } else if (userData.role === "Faculty" || userData.role === "Instructor") {
        navigate("/faculty");
      } else {
        navigate("/student");
      }
    } catch (err) {
      const serverMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.title;

      setError(
        serverMsg || (err.message?.includes("Network Error")
          ? "Cannot connect to server. Please ensure the backend is running on port 5291."
          : "Invalid credentials. Please verify your email and password.")
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
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          AI-LMS Secure Auth
        </span>
      </div>

      {/* Main Login Card */}
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
              Welcome back
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Continue your personalized learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              id="login-email"
              icon={Mail}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              id="login-password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <Alert type="error" className="py-2.5">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-xs">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Create account
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

export default Login;