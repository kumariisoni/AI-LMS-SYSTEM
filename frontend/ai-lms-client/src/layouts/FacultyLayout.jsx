import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  HelpCircle,
  FileText,
  Users,
  TrendingUp,
  BrainCircuit,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Avatar } from "../components/common/UIPrimitives";

function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/faculty", icon: LayoutDashboard, exact: true },
    { label: "My Courses", path: "/faculty/courses", icon: BookOpen },
    { label: "Create Course", path: "/faculty/create-course", icon: PlusCircle },
    { label: "Quizzes", path: "/faculty/quizzes", icon: HelpCircle },
    { label: "Assignments", path: "/faculty/assignments", icon: FileText },
    { label: "Students", path: "/faculty/students", icon: Users },
    { label: "Performance", path: "/faculty/performance", icon: TrendingUp },
    { label: "AI Insights", path: "/faculty/ai-insights", icon: BrainCircuit },
    { label: "Profile", path: "/faculty/profile", icon: User },
  ];

  const isNavActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-105">
              <img
                src="/learnova-icon.png"
                alt="Learnova AI"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <span>Learnova</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Faculty Studio
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                  active
                    ? "bg-indigo-600 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <Link
              to="/faculty/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <Avatar name={user?.name || "Faculty Member"} size="sm" />
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Faculty Member"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Instructor
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">AI-LMS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Faculty</span>
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {navItems.find((n) => isNavActive(n))?.label || "Faculty Studio"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public Site
            </Link>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" /> AI Pedagogical Co-Pilot
            </span>
            <Link
              to="/faculty/profile"
              className="flex items-center gap-2 p-0.5 rounded-lg hover:ring-2 hover:ring-indigo-100 transition-all"
              title="View Profile"
            >
              <Avatar name={user?.name || "Faculty"} size="sm" />
            </Link>
          </div>
        </header>

        {/* Centered Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default FacultyLayout;
