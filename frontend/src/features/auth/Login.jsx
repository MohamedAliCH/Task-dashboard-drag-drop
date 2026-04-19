import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/schema.js";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../lib/api.js";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, LayoutGrid } from "lucide-react";

function Field({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
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
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
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
      toast.error(err.response?.data?.msg || "Invalid credentials.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aurora-1 to-aurora-3 flex items-center justify-center text-white shadow-lg shadow-aurora-1/25 mb-6">
          <LayoutGrid className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Sign in to your workspace</p>

        {/* Form card */}
        <div className="w-full glass-panel p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Email" id="login-email" error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`glass-input pl-10 ${errors.email ? "ring-2 ring-red-500/40" : ""}`}
                  {...register("email")}
                />
              </div>
            </Field>

            <Field label="Password" id="login-pw" error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`glass-input pl-10 pr-10 ${errors.password ? "ring-2 ring-red-500/40" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full glass-button py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-aurora-1 hover:text-aurora-2 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
