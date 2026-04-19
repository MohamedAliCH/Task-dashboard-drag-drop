import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/schema.js";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../lib/api.js";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function Field({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error.message}
        </p>
      )}
    </div>
  );
}

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
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", { email: data.email, password: data.password });
      localStorage.setItem("token", res.data.token);
      login({ email: data.email });
      toast.success("Welcome back!");
      reset();
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid credentials. Please try again.");
    }
  };

  const inputBase = "glass-input";
  const inputError = "border-red-500 focus:ring-red-500/50";

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 animate-page-in">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aurora-1 to-aurora-3 flex items-center justify-center text-white shadow-lg shadow-aurora-1/30 mb-5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Log in to your workspace</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field label="Email address" id="email" error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`${inputBase} pl-9 ${errors.email ? inputError : ""}`}
                  {...register("email")}
                />
              </div>
            </Field>

            <Field label="Password" id="password" error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputBase} pl-9 pr-10 ${errors.password ? inputError : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full glass-button flex items-center justify-center gap-2 py-3 mt-8 text-[15px] shadow-md shadow-aurora-1/20"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-aurora-1 hover:text-aurora-2 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
