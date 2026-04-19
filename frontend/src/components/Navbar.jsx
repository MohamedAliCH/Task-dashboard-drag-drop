import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutGrid,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  BarChart3,
  User,
  Sun,
  Moon,
  Menu,
  X as CloseIcon,
} from "lucide-react";

const NavLink = ({ to, icon: Icon, children, onClick }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 transition-all duration-300 rounded-xl ${
        isActive
          ? "bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
};

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
    <header className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 transition-all duration-500">
      <div className="glass-panel px-4 py-3 sm:px-6 sm:py-3 flex items-center justify-between">
        <div className="flex items-center justify-between w-full h-10">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aurora-1 to-aurora-3 flex items-center justify-center text-white shadow-lg shadow-aurora-1/20">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-lg tracking-wide">SYS.BOARD_</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/stats" icon={BarChart3}>Stats</NavLink>
                <NavLink to="/profile" icon={User}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" icon={LogIn}>Login</NavLink>
                <NavLink to="/register" icon={UserPlus}>Register</NavLink>
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
              >
                <div className="relative w-5 h-5">
                  <Menu
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <CloseIcon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {user && (
        <div
          className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out mt-2 ${
            isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="glass-panel py-3 px-4 flex flex-col gap-1">
            <NavLink to="/dashboard" icon={LayoutDashboard} onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/stats" icon={BarChart3} onClick={closeMenu}>Stats</NavLink>
            <NavLink to="/profile" icon={User} onClick={closeMenu}>Profile</NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
