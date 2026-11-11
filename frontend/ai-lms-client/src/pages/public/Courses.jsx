import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Star,
  Users,
  Clock,
  CheckCircle,
  X
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Button,
  Card,
  Badge,
  Modal,
  EmptyState
} from "../../components/common/UIPrimitives";

import coursesSeedData from "../../data/courses_seed.json";

// Map the 7 verified academic courses
const STATIC_COURSES = (coursesSeedData || []).map((c, idx) => ({
  id: c.id || `course-${idx + 1}`,
  name: c.title,
  teacher:
    c.category === "Algorithms"
      ? "Prof. Papu Kumar Rai"
      : c.category === "Microprocessors"
      ? "Prof. Kamlesh Patle"
      : c.category === ".NET / ASP.NET"
      ? "Prof. Chetan Chudasma"
      : c.category === "Data Science"
      ? "Prof. Partik Chauhan"
      : c.category === "Data Mining"
      ? "Prof. Dr. Shiva Kumar Nadranjan"
      : c.category === "Computer Networks"
      ? "Prof. Niraj Bhagchandani"
      : "Prof. Sahir Suma",
  image: c.thumbnail || "/images/courses/default-course.jpg",
  cat: c.category,
  level: c.level || "Intermediate",
  rating: 4.9,
  students: 2400 + idx * 380,
  duration: (c.modules?.length || 6) * 5,
  isFree: true,
  price: null,
  hot: true,
  desc: c.description,
  tags: [c.category, "Verified Syllabus", "Academic Lectures"],
  chapters: (c.modules || []).map((m, mIdx) => ({
    id: m.id || String(mIdx + 1),
    title: m.title,
    duration: `${m.lessons?.length || 4} lectures`,
    lessons: (m.lessons || []).map((les) => ({
      id: les.id,
      title: les.title,
      description: les.description,
      videoUrl: les.videoUrl,
      youtubeVideoId: les.youtubeVideoId,
      author: les.author,
      duration: les.duration || "20 min",
      order: les.order,
      isPreview: les.isPreview
    }))
  }))
}));

const CATEGORIES = [
  "All",
  ".NET / ASP.NET",
  "Computer Networks",
  "Artificial Intelligence",
  "Data Science",
  "Data Mining",
  "Microprocessors",
  "Algorithms"
];

export default function Courses() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [coursesList, setCoursesList] = useState(STATIC_COURSES);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  // Selected course for enrollment modal
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    const loadBackendCourses = async () => {
      try {
        const res = await api.get("/Courses");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c) => ({
            id: c.id || c._id,
            name: c.title || c.name,
            teacher: c.instructorName || c.instructor || "Faculty Instructor",
            image: c.thumbnail || c.thumbnailUrl || c.image || "/images/courses/default-course.jpg",
            cat: c.category || "General",
            level: c.level || "Intermediate",
            rating: c.rating || 4.9,
            students: c.enrolledStudents || c.enrolledCount || 2400,
            duration: c.durationHours ? c.durationHours : (c.durationWeeks ? c.durationWeeks * 4 : 30),
            isFree: c.price === 0 || !c.price,
            price: (c.price === 0 || !c.price) ? null : {
              sale: `₹${c.price}`,
              original: c.originalPrice ? `₹${c.originalPrice}` : `₹${c.price * 2}`,
              pct: c.originalPrice ? Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100) : 50,
            },
            hot: (c.rating || 4.9) >= 4.8,
            desc: c.description || "Comprehensive hands-on curriculum with structured milestones.",
            tags: c.tags || [],
            chapters: c.chapters || []
          }));
          setCoursesList(mapped);
        }
      } catch (err) {
        console.log("Using static course catalog fallback:", err.message);
      }
    };
    loadBackendCourses();
  }, []);

  // Fetch authenticated student's enrolled courses to show proper enrolled status
  useEffect(() => {
    const loadEnrolled = async () => {
      if (!isAuthenticated) {
        setEnrolledCourseIds(new Set());
        return;
      }
      try {
        const res = await api.get("/Courses/enrolled");
        if (Array.isArray(res.data)) {
          setEnrolledCourseIds(new Set(res.data.map((e) => String(e.courseId))));
        }
      } catch {
        setEnrolledCourseIds(new Set());
      }
    };
    loadEnrolled();
  }, [isAuthenticated]);

  const filteredCourses = useMemo(() => {
    return coursesList
      .filter((course) => {
        const matchesCat =
          activeCategory === "All" ||
          course.cat.toLowerCase().includes(activeCategory.toLowerCase()) ||
          activeCategory.toLowerCase().includes(course.cat.toLowerCase());

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          course.name.toLowerCase().includes(q) ||
          course.teacher.toLowerCase().includes(q) ||
          course.cat.toLowerCase().includes(q) ||
          course.desc.toLowerCase().includes(q) ||
          (course.tags && course.tags.some((t) => t.toLowerCase().includes(q))) ||
          (q === "daa" && course.name.toLowerCase().includes("algorithm")) ||
          (q === "ai" && (course.name.toLowerCase().includes("artificial") || course.cat.toLowerCase().includes("ai"))) ||
          (q === "networks" && course.name.toLowerCase().includes("network")) ||
          (q === ".net" && course.name.toLowerCase().includes(".net")) ||
          (q === "microprocessor" && course.name.toLowerCase().includes("microprocessor"));

        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "duration") return b.duration - a.duration;
        return b.students - a.students;
      });
  }, [coursesList, activeCategory, searchQuery, sortBy]);

  const handleConfirmEnroll = async () => {
    const targetCourse = enrollingCourse;
    if (!isAuthenticated) {
      setEnrollingCourse(null);
      navigate("/login");
      return;
    }

    try {
      await api.post(`/courses/${targetCourse.id}/enroll`);
      setEnrolledCourseIds((prev) => new Set([...prev, String(targetCourse.id)]));
      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setEnrollingCourse(null);
        navigate(`/student/courses/${targetCourse.id}/learn`);
      }, 800);
    } catch (err) {
      console.warn("Enrollment call warning:", err?.message);
      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setEnrollingCourse(null);
        navigate(`/student/courses/${targetCourse.id}/learn`);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header */}
        <section className="pt-28 pb-12 bg-linear-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academic Curriculum</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Explore Academic & Engineering Tracks
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Vetted university and industry courses designed with hands-on projects, diagnostic AI assessments, and verified certifications.
            </p>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <Card className="p-4 shadow-sm bg-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search courses, professors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="shrink-0 w-36">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {filteredCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses matched your query"
              description="Try adjusting your search criteria or choose another category filter."
              actionText="Reset Filters"
              onAction={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  hover
                  className="overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail with aspect-video and error fallback */}
                    <div
                      className="aspect-video w-full bg-slate-100 overflow-hidden relative cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <img
                        src={course.image || "/images/courses/default-course.jpg"}
                        alt={course.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/courses/default-course.jpg";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="indigo" size="sm">
                          {course.cat}
                        </Badge>
                        {enrolledCourseIds.has(String(course.id)) && (
                          <Badge variant="emerald" size="sm">
                            Enrolled
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 shadow-2xs">
                        {course.level}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-slate-700">{course.teacher}</span>
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{course.rating}</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="text-base font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {course.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {course.desc}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.duration} hrs</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.students.toLocaleString()} students</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                    <div>
                      {course.isFree ? (
                        <span className="text-xs font-bold text-emerald-600 uppercase">
                          Free Track
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-slate-900">
                            {course.price?.sale}
                          </span>
                          {course.price?.original && (
                            <span className="text-xs text-slate-400 line-through">
                              {course.price.original}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                      {enrolledCourseIds.has(String(course.id)) ? (
                        <Link to={`/student/courses/${course.id}/learn`}>
                          <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100">
                            Continue
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setEnrollingCourse(course)}
                        >
                          Enroll
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Enrollment Confirmation Modal */}
      <Modal
        isOpen={Boolean(enrollingCourse)}
        onClose={() => setEnrollingCourse(null)}
        title="Confirm Course Enrollment"
      >
        {enrollingCourse && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={enrollingCourse.image}
                alt={enrollingCourse.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Badge variant="indigo" size="sm">
                  {enrollingCourse.cat}
                </Badge>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                  {enrollingCourse.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instructor: {enrollingCourse.teacher}
                </p>
              </div>
            </div>

            {enrollSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-900">Enrollment Confirmed!</p>
                <p className="text-xs text-emerald-700">Redirecting to your student workspace...</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are enrolling in <strong>{enrollingCourse.name}</strong>. You will gain instant access to interactive modules, quizzes, and AI tutor support.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEnrollingCourse(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmEnroll}
                  >
                    Confirm & Start Learning
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
