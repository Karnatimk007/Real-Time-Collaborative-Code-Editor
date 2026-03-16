import { NavLink } from "react-router-dom";

function Header() {
  return (
    <nav className="bg-red-400 p-4 flex justify-between items-center text-white font-semibold">

      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <img
          src="https://cdn-icons-png.flaticon.com/512/6062/6062646.png"
          alt="logo"
          className="w-8 h-8"
        />
        <span className="text-lg font-bold">CodeCollab</span>
      </div>

      {/* Navigation */}
      <div className="flex gap-6">
        <NavLink to="/" className="hover:text-black">Home</NavLink>
        <NavLink to="/login" className="hover:text-black">Login</NavLink>
        <NavLink to="/register" className="hover:text-black">Register</NavLink>
        
      </div>

    </nav>
  );
}

export default Header;