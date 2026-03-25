import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutGrid,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  User,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X as CloseIcon,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-indigo-600 dark:bg-gray-900 text-white shadow-lg border-b border-indigo-700 dark:border-gray-700 transition-colors duration-200">
      <div className="page-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-indigo-200 dark:hover:text-gray-300 transition-colors"
          >
            <LayoutGrid className="w-6 h-6" />
            <span>TaskFlow</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-x-2 sm:gap-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-700/60 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-200" />
              )}
            </button>

            {user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex sm:hidden items-center justify-center w-10 h-10 rounded-xl bg-indigo-700/60 dark:bg-gray-800 hover:bg-indigo-800 dark:hover:bg-gray-700 transition-all duration-300 relative group overflow-hidden"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 transform ${
                      isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    }`} 
                  />
                  <CloseIcon 
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 transform ${
                      isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`} 
                  />
                </div>
              </button>
            )}

            {user ? (
              <>
                {/* Dashboard link */}
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium hover:text-indigo-200 dark:hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Stats link */}
                <Link
                  to="/stats"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium hover:text-indigo-200 dark:hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700"
                >
                  <BarChart3 className="w-4 h-4" />
                  Stats
                </Link>

                {/* User info: Hidden in main bar on mobile (use hamburger), visible on desktop */}
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-indigo-200 dark:text-gray-400" />
                  <span className="hidden sm:block">{user.name || "User"}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium hover:bg-indigo-900 dark:hover:bg-gray-600 px-4 py-1.5 rounded-lg transition-colors shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium hover:text-indigo-200 dark:hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 dark:bg-gray-700 text-indigo-600 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-600 px-4 py-1.5 rounded-lg transition-colors shadow-md font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {user && (
        <div 
          className={`
            sm:hidden bg-indigo-700 dark:bg-gray-950/95 backdrop-blur-md border-t border-indigo-500/30 dark:border-gray-800 
            overflow-hidden transition-all duration-500 ease-in-out
            ${isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
          `}
        >
          <div className="px-6 py-8 space-y-4">
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-indigo-600 dark:hover:bg-gray-800 transition-all duration-300 font-semibold transform ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"} delay-100`}
            >
              <LayoutDashboard className="w-5 h-5 text-indigo-200 dark:text-gray-400" />
              Dashboard
            </Link>
            <Link
              to="/stats"
              onClick={closeMenu}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-indigo-600 dark:hover:bg-gray-800 transition-all duration-300 font-semibold transform ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"} delay-150`}
            >
              <BarChart3 className="w-5 h-5 text-indigo-200 dark:text-gray-400" />
              Stats
            </Link>
            <Link
              to="/profile"
              onClick={closeMenu}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-indigo-600 dark:hover:bg-gray-800 transition-all duration-300 font-semibold transform ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"} delay-200`}
            >
              <User className="w-5 h-5 text-indigo-200 dark:text-gray-400" />
              My Profile
            </Link>
            <div className={`pt-4 mt-4 border-t border-indigo-600 dark:border-gray-800 transform transition-all duration-500 delay-300 ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-100 hover:bg-red-500/20 dark:hover:bg-red-900/20 transition-all duration-300 font-bold group"
              >
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <LogOut className="w-5 h-5 text-red-300" />
                </div>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
