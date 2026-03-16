import { NavLink } from "react-router-dom";

function Header() {
  return (
    <nav className="bg-red-400 p-4 flex justify-end gap-15 text-white font-semibold">

      <NavLink to="/" className="hover:text-black">
        Home
      </NavLink>

      <NavLink to="/login" className="hover:text-black">
        Login
      </NavLink>

      <NavLink to="/register" className="hover:text-black">
        Register
      </NavLink>

      <NavLink to="/codingRoom" className="hover:text-black">CodingRoom</NavLink>

    </nav>
  );
}

export default Header;