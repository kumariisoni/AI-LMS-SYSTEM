import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to user's assigned dashboard or home if trying to access unauthorized route
      if (user?.role === "Admin") return <Navigate to="/admin" replace />;
      if (user?.role === "Faculty") return <Navigate to="/faculty" replace />;
      if (user?.role === "Student") return <Navigate to="/student" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
