// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./features/auth/Login";
import Navbar from "./components/Navbar";
import Register from "./features/auth/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Dashboard from "./features/auth/Dashboard";
import Profile from "./features/auth/Profile";
import Stats from "./features/analytics/Stats";
import { useTheme } from "./contexts/ThemeContext";
import PageTransition from "./components/PageTransition";

function AppContent() {
  const location = useLocation();
  const { isDark } = useTheme();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col flex-1 w-full transition-colors duration-200">
      {!isAuthPage && <Navbar />}

      <PageTransition>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <Dashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <Profile />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoutes>
                <Stats />
              </ProtectedRoutes>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="*"
            element={
              <div className="p-8 text-center dark:text-gray-300">
                404 – Page not found
              </div>
            }
          />
        </Routes>
      </PageTransition>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
