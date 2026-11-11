import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  Avatar
} from "../../components/common/UIPrimitives";
import FacultyAvatar from "../../components/common/FacultyAvatar";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

import coursesSeedData from "../../data/courses_seed.json";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const isPublic = !location.pathname.startsWith("/student");

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      let found = null;
      let allCourses = [];

      // 1. Try direct GET /api/courses/{id}
      try {
        const directRes = await api.get(`/Courses/${id}`);
        if (directRes.data && directRes.data.title) {
          found = directRes.data;
        }
      } catch {
        // Direct ID lookup may fail if id is not ObjectId format
      }

      // 2. Fetch all courses for related courses and fallback matching
      try {
        const listRes = await api.get("/Courses");
        if (Array.isArray(listRes.data)) {
          allCourses = listRes.data;
          if (!found) {
            found = allCourses.find((c) => String(c.id || c._id) === String(id));
          }
        }
      } catch {
        // ignore
      }

      // 3. Fallback to coursesSeedData if not found in backend
      if (!found) {
        const seedList = coursesSeedData || [];
        const seedMatch = seedList.find(
          (c, idx) =>
            String(c.id) === String(id) ||
            String(idx + 1) === String(id) ||
            c.title.toLowerCase().includes(String(id).toLowerCase())
        );

        if (seedMatch) {
          found = {
            id: seedMatch.id || id,
            title: seedMatch.title,
            description: seedMatch.description,
            category: seedMatch.category,
            level: seedMatch.level || "Intermediate",
            instructorName:
              seedMatch.category === "Algorithms"
                ? "Prof. Papu Kumar Rai"
                : seedMatch.category === "Microprocessors"
                ? "Prof. Kamlesh Patle"
                : seedMatch.category === ".NET / ASP.NET"
                ? "Prof. Chetan Chudasma"
                : seedMatch.category === "Data Science"
                ? "Prof. Partik Chauhan"
                : seedMatch.category === "Data Mining"
                ? "Prof. Dr. Shiva Kumar Nadranjan"
                : seedMatch.category === "Computer Networks"
                ? "Prof. Niraj Bhagchandani"
                : "Prof. Sahir Suma",
            instructorRole: "Faculty Lead & Subject Matter Expert",
            rating: 4.9,
            enrolledStudents: 2400,
            durationHours: (seedMatch.modules?.length || 6) * 5,
            price: 0,
            thumbnail: seedMatch.thumbnail,
            chapters: (seedMatch.modules || []).map((m, mIdx) => ({
              id: m.id || `mod-${mIdx + 1}`,
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
                order: les.order
              }))
            }))
          };
        }
      }

      setCourse(found);

      // Set related courses (excluding current course)
      const currentId = String(found?.id || found?._id || id);
      const otherList = allCourses.length > 0 ? allCourses : (coursesSeedData || []);
      const others = otherList
        .filter((c) => String(c.id || c._id) !== currentId)
        .slice(0, 2)
        .map((c) => ({
          id: c.id || c._id,
          title: c.title,
          category: c.category,
          level: c.level || "Intermediate",
          durationHours: c.durationHours || 30
        }));
      setRelatedCourses(others);

      // Verify authenticated student's actual enrollment status
      if (isAuthenticated) {
        try {
          const enrRes = await api.get("/Courses/enrolled");
          if (Array.isArray(enrRes.data)) {
            const alreadyEnrolled = enrRes.data.some(
              (e) => String(e.courseId) === currentId || String(e.courseId) === String(id)
            );
            setIsEnrolled(alreadyEnrolled);
          }
        } catch {
          setIsEnrolled(false);
        }
      }

    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleEnroll = async () => {
    const courseId = course?.id || course?._id || id;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isEnrolled) {
      navigate(`/student/courses/${courseId}/learn`);
      return;
    }
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setIsEnrolled(true);
      navigate(`/student/courses/${courseId}/learn`);
    } catch (err) {
      console.warn("Enrollment registration:", err?.message);
      setIsEnrolled(true);
      navigate(`/student/courses/${courseId}/learn`);
    }
  };

  const content = (
    <div className={`space-y-8 font-sans max-w-7xl mx-auto ${isPublic ? "pt-24 pb-16 px-4 sm:px-6 lg:px-8" : "pb-12"}`}>
      {/* Top Breadcrumb */}
      <div>
        <Link
          to={isPublic ? "/courses" : "/student/courses"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200/90 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-semibold">Loading course details...</p>
        </div>
      ) : !course ? (
        <div className="py-20 text-center">
          <h2 className="text-base font-bold text-slate-800">Course Not Found</h2>
          <Link to="/courses" className="text-xs font-bold text-indigo-600 mt-2 inline-block">
            Return to course catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols): Details, Learning outcomes, Chapters, Instructor */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Badge variant="indigo" size="sm">
                  {course.category || "Development"}
                </Badge>
                <Badge variant="slate" size="sm">
                  {course.level || "Intermediate"}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-bold text-slate-800">{course.rating || 4.9}</span>
                  <span>(1,240 ratings)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>{course.totalStudents || 4820} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.durationHours || 42} hours total</span>
                </div>
              </div>
            </div>

            {/* What you'll learn - Dynamic to course curriculum */}
            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>What You Will Master</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                {((course.chapters || []).length > 0
                  ? course.chapters.flatMap(c => (c.lessons || []).slice(0, 1).map(l => l.title)).slice(0, 6)
                  : [
                      `In-depth conceptual mastery of ${course.title}`,
                      "Modular academic curriculum with verified educational video lectures",
                      "Core theory, architectural foundations, and real-world engineering paradigms",
                      "Step-by-step lecture walkthroughs and hands-on conceptual demonstrations",
                      "Automated diagnostic quizzes and adaptive knowledge retention checks",
                      "Comprehensive milestone completion toward academic certification"
                    ]
                ).map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Chapters Accordion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Course Curriculum</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {course.chapters?.length || 0} Modules • {course.chapters ? course.chapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0) : 0} Lessons
                </span>
              </div>

              <div className="space-y-2">
                {(course.chapters || []).map((chap, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveChapter(activeChapter === idx ? -1 : idx)}
                      className="w-full p-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          {chap.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {chap.lessons?.length || 3} lessons • {chap.duration || "2 hrs"}
                        </p>
                      </div>
                      {activeChapter === idx ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {activeChapter === idx && (
                      <div className="p-4 bg-white divide-y divide-slate-100 text-xs">
                        {chap.lessons?.map((les, lidx) => (
                          <div key={lidx} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span className="font-medium text-slate-800">{les.title}</span>
                            </div>
                            <span className="text-slate-400 text-[11px] shrink-0">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Instructor Card */}
            <Card className="p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Lead Instructor</h3>
              <div className="flex items-start gap-4">
                <FacultyAvatar name={course.instructorName || "Faculty Instructor"} size="lg" />
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{course.instructorName || "Faculty Instructor"}</h4>
                  <p className="text-xs text-indigo-700 font-semibold">
                    {course.instructorRole || "Academic Faculty & Subject Matter Expert"}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Dedicated computer science and engineering faculty specializing in core university curricula, structured modular pedagogies, and practical demonstrations.
                  </p>
                </div>
              </div>
            </Card>

            {/* Related Courses (Dynamic) */}
            {relatedCourses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Related Tracks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedCourses.map((rel) => (
                    <Card key={rel.id} className="p-4 flex items-center justify-between hover:border-slate-300">
                      <div className="min-w-0 pr-3">
                        <Badge variant="indigo" size="sm">{rel.category || "Course"}</Badge>
                        <p className="text-xs font-bold text-slate-900 mt-1 truncate">{rel.title}</p>
                        <p className="text-[11px] text-slate-400">{rel.durationHours || 30} hours • {rel.level}</p>
                      </div>
                      <Link to={`/courses/${rel.id}`}>
                        <Button variant="ghost" size="sm" icon={ArrowRight} />
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Sticky Enrollment Box */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="overflow-hidden border-slate-200/90 shadow-sm">
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={course.thumbnail || "/images/courses/default-course.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/courses/default-course.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-2xs flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-white/95 text-indigo-600 flex items-center justify-center shadow-md">
                    <PlayCircle className="w-6 h-6 ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {course.price && course.price > 0 ? `₹${course.price}` : "Free"}
                  </span>
                  {course.price > 0 && (
                    <span className="text-xs text-slate-400 line-through">₹3,999</span>
                  )}
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                    62% OFF
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleEnroll}
                    className="w-full shadow-xs"
                  >
                    {isEnrolled ? "Continue Learning" : "Enroll Now & Start"}
                  </Button>
                  <p className="text-[11px] text-center text-slate-400">
                    30-day money-back guarantee • Full lifetime access
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <p className="font-bold text-slate-900">This course includes:</p>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>42 hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>14 downloadable coding exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>AI diagnostic quizzes & study plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Verified certificate of completion</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  if (isPublic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{content}</main>
        <Footer />
      </div>
    );
  }

  return content;
}
