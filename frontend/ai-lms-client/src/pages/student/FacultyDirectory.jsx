import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  GraduationCap,
  Search,
  Filter,
  ArrowRight,
  X,
  AlertCircle
} from "lucide-react";
import FacultyAvatar from "../../components/common/FacultyAvatar";
import {
  Button,
  Card,
  EmptyState,
  Skeleton
} from "../../components/common/UIPrimitives";

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/Faculty/directory");
      if (Array.isArray(response.data)) {
        setFaculty(response.data);
      } else {
        setFaculty([]);
      }
    } catch (err) {
      console.error("Failed to load faculty directory:", err);
      setError("Unable to load faculty directory at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const departments = ["All", ...new Set(faculty.map((f) => f.department).filter(Boolean))];

  const filteredFaculty = faculty.filter((f) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.name?.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q) ||
      f.designation?.toLowerCase().includes(q) ||
      f.subjects?.some((s) => s.toLowerCase().includes(q));

    const matchesDept = selectedDepartment === "All" || f.department === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Faculty</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Faculty Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Learn from experienced faculty members. Explore the instructors teaching verified curriculum across your AI-LMS.
          </p>
        </div>

        {!loading && (
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-2xs">
              Showing <span className="text-indigo-600 font-bold">{filteredFaculty.length}</span> of {faculty.length} Instructors
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchFaculty}>
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name, subject, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 text-slate-900 rounded-lg border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 transition-colors placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {departments.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDepartment === dept
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Faculty Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No faculty members found"
          description={
            search || selectedDepartment !== "All"
              ? "No faculty members match your current search terms or department filter."
              : "No faculty records are available at this time."
          }
          actionText={search || selectedDepartment !== "All" ? "Reset Filters" : undefined}
          onAction={() => {
            setSearch("");
            setSelectedDepartment("All");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFaculty.map((item) => {
            const primarySubject =
              item.subjects && item.subjects.length > 0
                ? item.subjects[0]
                : item.designation || "Computer Science";

            return (
              <Card
                key={item.id || item._id}
                className="p-5 flex flex-col justify-between hover:border-indigo-200 hover:shadow-xs transition-all duration-200 group bg-white"
              >
                <div className="space-y-3.5">
                  {/* Avatar + Main Details */}
                  <div className="flex items-start gap-3.5">
                    <FacultyAvatar name={item.name} size="md" />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {item.name}
                      </h3>

                      {/* Prominent Subject / Course Mapping */}
                      <p className="text-xs font-bold text-indigo-600 mt-1 truncate">
                        {primarySubject}
                      </p>

                      {item.department && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Secondary Subject Chips */}
                  {item.subjects && item.subjects.length > 1 && (
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-1">
                      {item.subjects.slice(1, 4).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200/80"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Short Bio snippet if available */}
                  {item.bio && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>
                  )}
                </div>

                {/* Footer with Experience & View Profile CTA */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {item.experienceYears ? `${item.experienceYears}+ yrs exp` : item.designation || "Faculty"}
                  </span>
                  <Link to={`/student/faculty/${item.id || item._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowRight}
                      className="group-hover:bg-indigo-50 group-hover:border-indigo-300 transition-colors text-xs"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
