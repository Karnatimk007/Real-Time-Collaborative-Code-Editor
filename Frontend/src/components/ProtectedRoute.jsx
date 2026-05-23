import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(location.pathname + (location.search || ""));
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />;
  }

  return children;
}

export default ProtectedRoute;