import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutGrid, LogOut, LogIn, UserPlus,
  LayoutDashboard, BarChart3, User,
  Sun, Moon, Menu, X as CloseIcon,
} from "lucide-react";

function NavLink({ to, icon: Icon, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 ${
        active
          ? "bg-white/30 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:bg-white/15 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-4 pb-2">
      <div className="page-container">
        <nav className="glass-panel px-5 py-2.5 flex items-center justify-between gap-4">
          {/* Left — Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 shrink-0 font-semibold text-slate-800 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-1 to-aurora-3 flex items-center justify-center text-white shadow-md shadow-aurora-1/20">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-base tracking-wide hidden sm:inline">TaskFlow</span>
          </Link>

          {/* Center — Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
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

          {/* Right — Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/15 dark:hover:bg-white/5 transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-500/10 px-3.5 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}

            {/* Mobile hamburger */}
            {user && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/15 dark:hover:bg-white/5 transition-colors"
              >
                <div className="relative w-5 h-5">
                  <Menu className={`absolute inset-0 transition-all duration-200 ${menuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100"}`} />
                  <CloseIcon className={`absolute inset-0 transition-all duration-200 ${menuOpen ? "opacity-100" : "opacity-0 -rotate-90 scale-50"}`} />
                </div>
              </button>
            )}
          </div>
        </nav>

        {/* Mobile dropdown */}
        {user && (
          <div className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${menuOpen ? "max-h-60 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
            <div className="glass-panel py-2 px-3 flex flex-col gap-0.5">
              <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/stats" icon={BarChart3} onClick={() => setMenuOpen(false)}>Stats</NavLink>
              <NavLink to="/profile" icon={User} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl text-red-500 hover:bg-red-50/80 dark:hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
