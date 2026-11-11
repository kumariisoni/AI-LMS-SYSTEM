import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import {
  GraduationCap,
  Mail,
  Clock,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers
} from "lucide-react";
import FacultyAvatar from "../../components/common/FacultyAvatar";
import {
  Card,
  Badge,
  EmptyState,
  Skeleton,
  Button
} from "../../components/common/UIPrimitives";

export default function FacultyProfile() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  const fetchFacultyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/Faculty/${id}`);
      const facultyData = res.data;
      setFaculty(facultyData);

      // Check if backend returned courses directly in the faculty payload
      if (Array.isArray(facultyData?.courses) && facultyData.courses.length > 0) {
        setCourses(facultyData.courses);
      } else {
        // Fallback: query courses directly and match by InstructorId or Name
        try {
          const cRes = await api.get("/Courses");
          if (Array.isArray(cRes.data)) {
            const matched = cRes.data.filter(
              (c) =>
                c.instructorId === facultyData?.userId ||
                c.instructorId === facultyData?.id ||
                c.instructorName?.toLowerCase() === facultyData?.name?.toLowerCase()
            );
            setCourses(matched);
          }
        } catch (cErr) {
          console.error("Failed to load courses for faculty:", cErr);
        }
      }
    } catch (err) {
      console.error("Failed to load faculty profile:", err);
      setError("Unable to load faculty member details. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFacultyProfile();
  }, [fetchFacultyProfile]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl md:col-span-1" />
          <Skeleton className="h-64 w-full rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <EmptyState
          icon={GraduationCap}
          title="Faculty Member Not Found"
          description={error || "The requested faculty profile does not exist."}
          actionText="Back to Faculty Directory"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const primarySubject =
    faculty.subjects && faculty.subjects.length > 0
      ? faculty.subjects[0]
      : faculty.designation || "Computer Science";

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-16">
      {/* Back to Directory Link */}
      <div>
        <Link
          to="/student/faculty"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200/90 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Faculty Directory</span>
        </Link>
      </div>

      {/* Main Faculty Header Card (Visual Identity with FacultyAvatar, NO image) */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <FacultyAvatar
            name={faculty.name}
            size="2xl"
            className="w-24 h-24 sm:w-28 sm:h-28 text-3xl font-extrabold shrink-0"
          />

          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {faculty.name}
              </h1>
              <Badge variant="indigo" size="sm">
                Verified Faculty
              </Badge>
            </div>

            {/* Primary Subject and Department/Designation */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-indigo-600">
                {primarySubject}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                {[faculty.designation, faculty.department].filter(Boolean).join(" • ")}
              </p>
            </div>

            {/* Meta details: Experience & Email (only if available) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              {faculty.experienceYears ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{faculty.experienceYears} Years Academic Experience</span>
                </div>
              ) : null}

              {faculty.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{faculty.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Column Layout: Details on Left, Courses Taught on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: About & Subjects */}
        <div className="md:col-span-1 space-y-5">
          {/* About Section */}
          {faculty.bio && (
            <Card className="p-5 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>About</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {faculty.bio}
              </p>
            </Card>
          )}

          {/* Subjects Section */}
          {faculty.subjects && faculty.subjects.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Subjects & Specializations</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {faculty.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/90"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Office Hours (only if data exists) */}
          {faculty.officeHours && (
            <Card className="p-5 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Office Hours</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {faculty.officeHours}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Courses Taught */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Courses Taught</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {courses.length} Assigned {courses.length === 1 ? "Course" : "Courses"}
            </span>
          </div>

          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses assigned yet"
              description="This faculty member currently has no active published courses in the catalog."
            />
          ) : (
            <div className="space-y-3">
              {courses.map((c) => {
                const courseId = c.id || c._id;
                return (
                  <Card
                    key={courseId}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-xs transition-all duration-150 group"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="indigo" size="sm">
                          {c.category || "Academic Course"}
                        </Badge>
                        <Badge variant="slate" size="sm">
                          {c.level || "Intermediate"}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {c.title}
                      </h4>
                      {c.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Link to={`/student/courses/${courseId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={ArrowRight}
                          className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors whitespace-nowrap"
                        >
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
