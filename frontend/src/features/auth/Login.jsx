import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/schema.js";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../lib/api.js";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  LayoutGrid,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem("token", res.data.token);
      login({ email: data.email });
      toast.success("Welcome back! 👋");
      reset();
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.msg ||
          "Invalid email or password. Please try again.",
      );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-200 px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements for a premium feel */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl mb-4 group hover:scale-105 transition-transform duration-300">
            <LayoutGrid className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            TaskFlow
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Sign in to manage your tasks
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email address
              </label>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-colors focus-within:ring-2 ${
                  errors.email
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus-within:ring-red-400"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                }`}
              >
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-colors focus-within:ring-2 ${
                  errors.password
                    ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus-within:ring-red-400"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:ring-indigo-500 focus-within:border-indigo-500"
                }`}
              >
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
