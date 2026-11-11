import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Users
} from "lucide-react";
import { useState } from "react";

const STATS = [
  { value: "12,000+", label: "Active Students", icon: Users },
  { value: "240+", label: "Verified Courses", icon: BookOpen },
  { value: "94%", label: "Career Placement", icon: Award },
  { value: "58", label: "Countries Reached", icon: ShieldCheck },
];

const FOOTER_COLUMNS = [
  {
    title: "Learning Tracks",
    links: [
      { label: "Full Stack Web Engineering", to: "/courses" },
      { label: "Database Management & Systems", to: "/courses" },
      { label: "Cloud & Microservices", to: "/courses" },
      { label: "Machine Learning & AI", to: "/courses" },
      { label: "UI / UX Design Systems", to: "/courses" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Browse Course Catalog", to: "/courses" },
      { label: "Faculty Directory", to: "/faculty" },
      { label: "Student Portal", to: "/student" },
      { label: "Faculty Studio", to: "/faculty" },
      { label: "Admin Operations", to: "/admin" },
    ],
  },
  {
    title: "Institution",
    links: [
      { label: "About Learnova AI", to: "/about" },
      { label: "Academic Advisory", to: "/about" },
      { label: "Contact & Support", to: "/contact" },
      { label: "Help & FAQ", to: "/contact" },
      { label: "Privacy & Terms", to: "/contact" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800" role="contentinfo">
      {/* Top Value / Statistics Highlight Strip */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand & Mission Column (Col 1-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105">
                <img
                  src="/learnova-icon.png"
                  alt="Learnova AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-lg text-white tracking-tight">
                  <span>Learnova</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    AI
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Autonomous Learning Platform
                </div>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              An intelligent Learning Management System designed for rigorous software engineering, modern systems architecture, and AI-guided diagnostics.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Rajkot, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <a href="sushantpathak2028@gmail.com" className="hover:text-white transition-colors">
                  sushantpathak2028@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <a href="tel:+91 70507 94068" className="hover:text-white transition-colors">
                  +91 70507 94068
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links Columns (Col 5-9) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {FOOTER_COLUMNS.map((col, idx) => (
              <div key={idx} className="space-y-3.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.to}
                        className="text-xs text-slate-400 hover:text-indigo-300 transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter / Bulletin Column (Col 10-12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Curriculum Bulletin</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Stay ahead of modern tech shifts
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Weekly syllabus releases, AI diagnostic benchmarks, and faculty masterclasses.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter university email..."
                  className="w-full h-10 px-3.5 text-xs text-white placeholder-slate-500 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/20"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-emerald-400 font-medium">
                ✓ Successfully subscribed to Learnova updates.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Legal & Social */}
      <div className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} Learnova AI Inc. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/about" className="hover:text-white transition-colors">
                Academic Integrity
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Security Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
