import { NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { toast } from "sonner";

function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      description: "See you again soon!",
    });
  };

  return (
    <nav className="navbar">
      {/* 🔷 Logo */}
      <div className="logo">
        <span>{"</>"}</span> CodeSync
      </div>

      {/* 🔗 Navigation */}
      <div className="nav-links">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>

        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className="btn btn-outline">
              Login
            </NavLink>

            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>

            {/* 👤 User */}
            <span className="nav-link" style={{ cursor: "default" }}>
              Hi, {currentUser?.username || "User"}
            </span>

            {/* 🚪 Logout */}
            <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header;