import { NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";

function Header() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <nav className="bg-[#0f172a] border-b border-gray-800 px-6 py-3 flex justify-between items-center">

      {/* 🔷 Logo */}
      <div className="flex items-center gap-2 text-blue-400 font-semibold text-lg cursor-pointer">
        <span className="text-xl">{"</>"}</span>
        <span>CodeSync</span>
      </div>

      {/* 🔗 Navigation */}
      <div className="flex items-center gap-6 text-gray-300">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `hover:text-white transition ${isActive ? "text-white" : ""}`
          }
        >
          Home
        </NavLink>

        {!isAuthenticated ? (
          <>
            <NavLink
              to="/login"
              className="px-4 py-1 border border-gray-700 rounded hover:bg-gray-800 transition"
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className="px-4 py-1 bg-blue-500 rounded hover:bg-blue-600 transition text-white"
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/codingroom/test"
              className="hover:text-white transition"
            >
              CodingRoom
            </NavLink>

            {/* 👤 User */}
            <span className="text-sm text-gray-400">
              Hi, {currentUser?.name || "User"}
            </span>

            {/* 🚪 Logout */}
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition text-white"
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

export default Header;