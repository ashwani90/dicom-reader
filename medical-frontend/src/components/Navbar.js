import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react"; // icon library

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Logo / App Name */}
      <div className="text-xl font-semibold text-gray-800">
        DICOM Viewer
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-6 text-gray-600 text-sm">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <Link to="/cases" className="hover:text-blue-600 transition">
          Cases
        </Link>
        <Link to="/viewer" className="hover:text-blue-600 transition">
          Viewer
        </Link>
        <Link to="/about" className="hover:text-blue-600 transition">
          About
        </Link>
      </div>

      {/* Mobile Menu */}
      <button className="md:hidden text-gray-700">
        <Menu size={22} />
      </button>
    </nav>
  );
};

export default Navbar;
