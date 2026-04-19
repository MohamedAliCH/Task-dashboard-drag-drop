import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const initial = (user.name?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase();

  return (
    <div className="flex-1">
      <div className="page-container py-6 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Account information</p>
        </div>

        {/* Card — capped at max-w-2xl for readability */}
        <div className="glass-panel overflow-hidden max-w-2xl">
          {/* Avatar banner */}
          <div className="p-6 flex items-center gap-5 border-b border-slate-200/40 dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.03]">
            <div className="w-16 h-16 bg-gradient-to-br from-aurora-1 to-aurora-3 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-aurora-1/20">
              <span className="text-2xl font-bold">{initial}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user.name || "User"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 pb-4 border-b border-slate-200/40 dark:border-white/[0.06]">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">Name</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name || "—"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">Email</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
