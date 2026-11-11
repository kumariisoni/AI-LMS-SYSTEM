import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TestAPI from "./pages/TestAPI";
import Courses from "./pages/public/Courses";
import About from "./pages/public/About";
import Faculty from "./pages/public/Faculty";
import Contact from "./pages/public/Contact";
import { useAuth } from "./context/AuthContext";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import FacultyDirectory from "./pages/student/FacultyDirectory";
import StudentFacultyDetail from "./pages/student/FacultyProfile";
import MyCoursesStudent from "./pages/student/MyCourses";
import CourseDetails from "./pages/student/CourseDetails";
import LearnCourse from "./pages/student/LearnCourse";
import Progress from "./pages/student/Progress";
import QuizStudent from "./pages/student/Quiz";
import Recommendations from "./pages/student/Recommendations";
import StudyPlan from "./pages/student/StudyPlan";
import AIChat from "./pages/student/AIChat";
import Certificates from "./pages/student/Certificates";
import StudentProfile from "./pages/student/Profile";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MyCoursesFaculty from "./pages/faculty/MyCourses";
import CreateCourse from "./pages/faculty/CreateCourse";
import ManageQuizzes from "./pages/faculty/ManageQuizzes";
import Assignments from "./pages/faculty/Assignments";
import StudentsFaculty from "./pages/faculty/Students";
import StudentPerformance from "./pages/faculty/StudentPerformance";
import AIInsights from "./pages/faculty/AIInsights";
import FacultyProfile from "./pages/faculty/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyManagement from "./pages/admin/FacultyManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import AnalyticsAdmin from "./pages/admin/Analytics";
import SettingsAdmin from "./pages/admin/Settings";

function FacultyRouteDispatcher() {
  const { user, isAuthenticated } = useAuth();
  const isFaculty = isAuthenticated && (user?.role === "Faculty" || user?.role === "Instructor");
  if (isFaculty) {
    return <FacultyLayout />;
  }
  return <Faculty />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:id/learn" element={<LearnCourse />} />
          <Route path="/courses/:id/learn/:lessonId" element={<LearnCourse />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-api" element={<TestAPI />} />

          {/* Legacy /instructor redirect */}
          <Route path="/instructor/*" element={<Navigate to="/faculty" replace />} />

          {/* Faculty Route (Public Directory for guests/students, Studio for logged-in Faculty) */}
          <Route path="/faculty" element={<FacultyRouteDispatcher />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="courses" element={<MyCoursesFaculty />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="quizzes" element={<ManageQuizzes />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="students" element={<StudentsFaculty />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="faculty" element={<FacultyDirectory />} />
            <Route path="faculty/:id" element={<StudentFacultyDetail />} />
            <Route path="courses" element={<MyCoursesStudent />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="courses/:id/learn" element={<LearnCourse />} />
            <Route path="courses/:id/learn/:lessonId" element={<LearnCourse />} />
            <Route path="quizzes" element={<QuizStudent />} />
            <Route path="progress" element={<Progress />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="study-plan" element={<StudyPlan />} />
            <Route path="ai-assistant" element={<AIChat />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>


          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="faculty" element={<FacultyManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="enrollments" element={<EnrollmentManagement />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;