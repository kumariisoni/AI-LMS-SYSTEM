import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  GraduationCap,
  ArrowRight,
  X
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import api from "../../services/api";
import FacultyAvatar from "../../components/common/FacultyAvatar";
import {
  Card,
  Badge,
  Button,
  EmptyState
} from "../../components/common/UIPrimitives";

const STATIC_FACULTY = [
  {
    id: "1",
    name: "Prof. Chetan Chudasma",
    subject: "ASP.NET / .NET",
    role: "Professor & HOD",
    badge: "Senior Faculty",
    experience: "14+ years",
    rating: 4.9,
    students: 4500,
    department: "Computer Science & Engineering",
    skills: ["ASP.NET / .NET", "C#", "Web API", "Enterprise Software"],
    bio: "Distinguished professor in Computer Science with over 14 years of teaching and software engineering experience. Specializes in the .NET ecosystem and ASP.NET Core enterprise architecture.",
  },
  {
    id: "2",
    name: "Prof. Papu Kumar Rai",
    subject: "Design and Analysis of Algorithms",
    role: "Associate Professor",
    badge: "Algorithms Lead",
    experience: "11+ years",
    rating: 4.9,
    students: 4500,
    department: "Computer Science & Engineering",
    skills: ["Design and Analysis of Algorithms", "DAA", "Data Structures", "Graph Theory"],
    bio: "Senior faculty specializing in Design and Analysis of Algorithms, algorithmic complexity, graph theory, and advanced data structures.",
  },
  {
    id: "3",
    name: "Prof. Partik Chauhan",
    subject: "Data Science",
    role: "Assistant Professor",
    badge: "Data Science Lead",
    experience: "8+ years",
    rating: 4.9,
    students: 4500,
    department: "Computer Science & Engineering",
    skills: ["Data Science", "Python", "Machine Learning", "Statistical Analysis"],
    bio: "Educator and researcher in modern Data Science, statistical modeling, machine learning algorithms, and predictive AI pipelines using Python.",
  },
  {
    id: "4",
    name: "Prof. Kamlesh Patle",
    subject: "Fundamentals of Microprocessor",
    role: "Associate Professor",
    badge: "Systems Lead",
    experience: "12+ years",
    rating: 4.9,
    students: 4500,
    department: "Computer Engineering",
    skills: ["Fundamentals of Microprocessor", "Microprocessors", "8085 / 8086 Assembly", "Computer Architecture"],
    bio: "Expert in microprocessor architectures, assembly language programming, microcontrollers, embedded hardware interfaces, and computer systems organization.",
  },
  {
    id: "5",
    name: "Prof. Dr. Shiva Kumar Nadranjan",
    subject: "Data Warehouse & Data Mining",
    role: "Professor & Research Lead",
    badge: "Doctorate Lead",
    experience: "16+ years",
    rating: 4.9,
    students: 4500,
    department: "Information Technology & Data Engineering",
    skills: ["Data Warehouse & Data Mining", "Data Mining", "Data Warehousing", "Big Data Analytics"],
    bio: "Doctorate in Data Warehousing and Knowledge Discovery. Research focuses on OLAP data modeling, ETL architectures, and enterprise data mining frameworks.",
  },
  {
    id: "6",
    name: "Prof. Niraj Bhagchandani",
    subject: "Computer Networks",
    role: "Associate Professor",
    badge: "Networks Lead",
    experience: "10+ years",
    rating: 4.9,
    students: 4500,
    department: "Computer Science & Engineering",
    skills: ["Computer Networks", "Network Security", "TCP/IP Protocols", "Distributed Systems"],
    bio: "Computer Networks educator specializing in network protocol engineering, TCP/IP stack, network security, packet routing architectures, and distributed systems.",
  },
  {
    id: "7",
    name: "Prof. Sahir Suma",
    subject: "Artificial Intelligence",
    role: "Assistant Professor",
    badge: "AI Specialist",
    experience: "9+ years",
    rating: 4.9,
    students: 4500,
    department: "Artificial Intelligence & Machine Learning",
    skills: ["Artificial Intelligence", "Knowledge Systems", "Search Algorithms", "Machine Learning"],
    bio: "Researcher and lecturer in Artificial Intelligence, state-space search algorithms, knowledge representation, neural computation, and automated reasoning systems.",
  }
];

export default function Faculty() {
  const [facultyList, setFacultyList] = useState(STATIC_FACULTY);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLiveFaculty = async () => {
      try {
        const res = await api.get("/Faculty/directory");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((f, i) => ({
            id: f.id || f.userId || String(i + 1),
            name: f.name,
            subject: f.subjects?.[0] || f.designation || "Computing",
            role: f.designation || f.department || "Faculty Member",
            badge: f.experienceYears >= 12 ? "Senior Professor" : "Academic Faculty",
            experience: `${f.experienceYears || 5}+ years`,
            rating: f.rating || 4.9,
            students: f.totalStudents || 4500,
            department: f.department || "Computer Science",
            skills: f.subjects || ["Software Engineering", "AI Systems"],
            bio: f.bio || `Specialist in ${f.department || "Computing"} at Learnova AI.`,
          }));
          setFacultyList(mapped);
        }
      } catch (err) {
        console.log("Using static faculty directory fallback:", err.message);
      }
    };
    fetchLiveFaculty();
  }, []);

  const filteredFaculty = useMemo(() => {
    return facultyList.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.role?.toLowerCase().includes(search.toLowerCase()) ||
        m.department?.toLowerCase().includes(search.toLowerCase()) ||
        m.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [facultyList, search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Section */}
        <section className="pt-28 pb-12 bg-linear-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Directory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Distinguished Academic Faculty
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Learn from experienced professors and department leaders teaching verified university curricula across engineering, computing, and intelligence systems.
            </p>

            {/* Search Box */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty by name, subject, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs shadow-2xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Faculty Grid (Desktop 3-4, Tablet 2, Mobile 1) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {filteredFaculty.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No faculty members found"
              description="Try adjusting your search terms or view the full directory."
              actionText="Clear Search"
              onAction={() => setSearch("")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFaculty.map((item) => (
                <Card
                  key={item.id}
                  hover
                  className="p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-2xs"
                >
                  <div>
                    {/* Top Avatar & Badges */}
                    <div className="flex items-start gap-3.5">
                      <FacultyAvatar name={item.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <Badge variant="indigo" size="sm">
                          {item.badge}
                        </Badge>
                        <h3 className="text-sm font-bold text-slate-900 truncate mt-1">
                          {item.name}
                        </h3>
                        <p className="text-xs font-bold text-indigo-600 truncate">
                          {item.subject}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.department}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Experience:</span>
                        <span className="font-semibold text-slate-800">{item.experience}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Designation:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[140px] text-right">{item.role}</span>
                      </div>
                    </div>

                    {item.skills && item.skills.length > 1 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {item.skills.slice(1, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-medium border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Link to={`/student/faculty/${item.id}`} className="w-full">
                      <Button variant="secondary" size="sm" className="w-full justify-between">
                        <span>View Faculty Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
