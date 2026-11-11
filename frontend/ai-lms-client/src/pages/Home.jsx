import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Bot,
  Calendar,
  Star,
  GraduationCap,
  Compass
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Button, Card, Badge } from "../components/common/UIPrimitives";
import api from "../services/api";

const STATIC_FEATURED = [
  {
    id: "course-1",
    name: ".NET & ASP.NET Core Web Development",
    teacher: "Prof. Chetan Chudasma",
    instructorRole: "Professor & HOD",
    image: "/images/courses/dotnet.jpg",
    cat: ".NET / ASP.NET",
    level: "Intermediate",
    rating: 4.9,
    students: 2400,
    duration: 35,
    desc: "Comprehensive engineering curriculum covering C#, ASP.NET Core Web APIs, dependency injection, and MongoDB.",
  },
  {
    id: "course-2",
    name: "Computer Networks — Complete Course",
    teacher: "Prof. Niraj Bhagchandani",
    instructorRole: "Associate Professor",
    image: "/images/courses/computer-networks.jpg",
    cat: "Computer Networks",
    level: "Intermediate",
    rating: 4.9,
    students: 2800,
    duration: 30,
    desc: "Complete university syllabus covering OSI 7 layers, TCP/IP, IPv4 addressing, subnetting, and network security.",
  },
  {
    id: "course-3",
    name: "Artificial Intelligence — Fundamentals to Applications",
    teacher: "Prof. Sahir Suma",
    instructorRole: "Assistant Professor",
    image: "/images/courses/artificial-intelligence.jpg",
    cat: "Artificial Intelligence",
    level: "Intermediate",
    rating: 4.9,
    students: 3100,
    duration: 32,
    desc: "Intelligent agents, state space search (BFS, DFS, A*), knowledge representation, first-order logic, and neural networks.",
  },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Adaptive Diagnostic Engine",
    desc: "Assessments calibrate question difficulty dynamically based on accuracy, pinpointing conceptual weak points.",
    badge: "AI Assessment",
  },
  {
    icon: Calendar,
    title: "Personalized Study Roadmaps",
    desc: "Timelines adjust to your available study hours, target deadlines, and individual progression curves.",
    badge: "Adaptive Roadmap",
  },
  {
    icon: Bot,
    title: "24/7 Contextual AI Tutor",
    desc: "Receive immediate explanations, code debugging guidance, and conceptual breakdowns without waiting for office hours.",
    badge: "AI Assistant",
  },
  {
    icon: GraduationCap,
    title: "Faculty Mentorship & Oversight",
    desc: "Learn directly from vetted university professors and senior engineers with structured curriculum reviews.",
    badge: "Verified Faculty",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Diagnostic Baseline",
    desc: "Take an AI-powered diagnostic assessment to identify competencies and pinpoint knowledge gaps.",
  },
  {
    step: "02",
    title: "Calibrated Roadmap",
    desc: "Follow an automatically sequenced roadmap with targeted lessons, quizzes, and hands-on coding labs.",
  },
  {
    step: "03",
    title: "Mastery & Certification",
    desc: "Demonstrate verified concept mastery, earn credentials, and showcase your achievements to employers.",
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState(STATIC_FEATURED);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/Courses");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.slice(0, 3).map((c, i) => ({
            id: c.id || c._id || String(i + 1),
            name: c.title || c.name || "Course Title",
            teacher: c.instructorName || c.instructor || "Faculty",
            instructorRole: c.department || "Instructor",
            image:
              c.thumbnail ||
              c.thumbnailUrl ||
              c.image ||
              STATIC_FEATURED[i % STATIC_FEATURED.length].image,
            cat: c.category || "Technology",
            level: c.level || "Intermediate",
            rating: c.rating || 4.9,
            students: c.enrolledStudents || c.enrolledCount || 2400 + i * 250,
            duration: c.durationHours || 32,
            desc: c.description || "Comprehensive hands-on track designed for practical mastery.",
          }));
          setCourses(mapped);
        }
      } catch {
        // Fallback to STATIC_FEATURED
      }
    };
    fetchCourses();
  }, []);

  const getPortalLink = () => {
    if (!isAuthenticated) return "/register";
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "/admin";
    if (role === "faculty" || role === "instructor") return "/faculty";
    return "/student";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION (Step 26: Large headline, short description, primary CTA, secondary CTA) */}
        <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 border-b border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline and CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Next-Generation Adaptive Learning Management</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Learn Smarter with{" "}
                  <span className="text-indigo-600">AI-Calibrated</span> Education
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  AI-LMS combines academic curricula with real-time AI diagnostics. Get tailored study roadmaps, automated weakness detection, and 24/7 interactive tutoring.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link to={getPortalLink()} className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xs" icon={ArrowRight}>
                      {isAuthenticated ? "Enter Workspace" : "Get Started Free"}
                    </Button>
                  </Link>

                  <Link to="/courses" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" icon={Compass}>
                      Browse Courses
                    </Button>
                  </Link>
                </div>

                {/* Proof Metrics */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time AI Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Role-Based Portals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Certifications</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Interactive Preview Card */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-slate-50/50 border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">AI Diagnostic Monitor</p>
                        <p className="text-[10px] text-slate-500">Live Knowledge Analysis</p>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm" icon={CheckCircle2}>
                      Active
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">DBMS — Normalization</span>
                      <span className="font-bold text-indigo-600">82% Mastery</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full w-[82%]" />
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1">
                      AI Feedback: 3NF transitive dependency review recommended
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                      <p className="text-xs text-slate-500 font-medium">Diagnostic Quizzes</p>
                      <p className="text-lg font-bold text-indigo-700 mt-0.5">8 Completed</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                      <p className="text-xs text-slate-500 font-medium">Accuracy Rate</p>
                      <p className="text-lg font-bold text-emerald-700 mt-0.5">94.2%</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FEATURED COURSES (Step 26) */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Curriculum Catalog
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Featured Academic Tracks
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Master industry-relevant skills with structured courses and verified credentials.
                </p>
              </div>

              <Link to="/courses">
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  View All Courses
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="aspect-video w-full bg-slate-100 overflow-hidden relative cursor-pointer">
                      <Link to={`/courses/${course.id}`}>
                        <img
                          src={course.image || "/images/courses/default-course.jpg"}
                          alt={course.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/courses/default-course.jpg";
                          }}
                        />
                      </Link>
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-slate-800 shadow-2xs">
                        {course.cat}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{course.level}</span>
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          {course.rating}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                        {course.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {course.desc}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{course.teacher}</span>
                        <span>{course.duration} Hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="outline" size="sm" className="w-full" icon={ArrowRight}>
                        View Curriculum
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3. HOW AI-LMS WORKS (Step 26) */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How Learnova AI Accelerates Mastery
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                A structured three-step pedagogical loop that detects gaps and reinforces retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.step} className="p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <span className="text-2xl font-black text-indigo-600 font-mono">
                    {s.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PLATFORM CAPABILITIES (Step 26: FEATURES) */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed for Serious Academic & Technical Rigor
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Eliminate learning bottlenecks with continuous diagnostic intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <Card key={feat.title} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="slate" size="sm" className="mb-2">
                        {feat.badge}
                      </Badge>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 mb-1.5">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION (Step 26) */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to experience modern adaptive learning?
            </h2>
            <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Join thousands of students and faculty members using Learnova AI to accelerate curriculum mastery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" size="lg">
                  Explore Catalog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
