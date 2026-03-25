import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../lib/schema";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../lib/api.js";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  LayoutGrid,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", res.data.token);
      login({ name: data.name, email: data.email });
      toast.success("Account created! Welcome aboard 🎉");
      reset();
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(
        err.response?.data?.msg || "Registration failed. Please try again.",
      );
    }
  };

  // Reusable class builder for the flex input wrapper
  const wrapperClass = (hasError) =>
    `flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-colors focus-within:ring-2 ${
      hasError
        ? "border-red-400 bg-red-50 dark:bg-red-900/20 focus-within:ring-red-400"
        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:ring-indigo-400 focus-within:border-indigo-400"
    }`;

  const inputClass =
    "flex-1 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  const iconClass = (hasError) =>
    `w-4 h-4 shrink-0 ${hasError ? "text-red-400" : "text-gray-400"}`;

  return (
    <div className="flex-1 flex bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center space-y-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LayoutGrid className="w-12 h-12" />
            <span className="text-4xl font-bold tracking-tight">TaskFlow</span>
          </div>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Organize your work, track your progress, and get things done — all
            in one place.
          </p>
          <div className="space-y-5 text-left mt-8">
            {[
              "Drag-and-drop Kanban board",
              "Priority & due date tracking",
              "Real-time task management",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                <span className="text-indigo-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center px-8 py-14 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <LayoutGrid className="w-7 h-7 text-indigo-600" />
              <span className="text-2xl font-bold text-indigo-600">
                TaskFlow
              </span>
            </div>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl mb-4">
              <UserPlus className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create an account
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Start managing your tasks today — it's free.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <div
                className={wrapperClass(!!errors.name)}
              >
                <User className={iconClass(!!errors.name)} />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  className={inputClass}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <div
                className={wrapperClass(!!errors.email)}
              >
                <Mail className={iconClass(!!errors.email)} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div
                className={wrapperClass(!!errors.password)}
              >
                <Lock className={iconClass(!!errors.password)} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={inputClass}
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <div
                className={wrapperClass(!!errors.confirmPassword)}
              >
                <Lock className={iconClass(!!errors.confirmPassword)} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={inputClass}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
