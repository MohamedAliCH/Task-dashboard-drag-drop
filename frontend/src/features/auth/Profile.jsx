import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="flex-1 animate-page-in">
      <div className="page-container py-8 flex flex-col gap-6 mx-auto max-w-2xl">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent tracking-tight">Account Profile</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Identity & Configuration</p>
        </div>

        {/* Profile Card */}
        <div className="glass-panel overflow-hidden">
          {/* Avatar Area */}
          <div className="p-8 flex items-center gap-6 border-b border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md">
            <div className="w-24 h-24 bg-gradient-to-br from-aurora-1 to-aurora-3 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-aurora-1/20">
              <span className="text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{user.name || "Unidentified User"}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>
          
          {/* Details */}
          <div className="p-8">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
              Personal Details
            </h3>
            
            <div className="flex flex-col gap-5">
              {/* Name Field */}
              <div className="flex flex-col sm:flex-row sm:items-center pb-5 border-b border-slate-200/50 dark:border-slate-700/50 gap-2 sm:gap-6">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-32 shrink-0">Designation</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name || "UNIDENTIFIED"}</span>
              </div>
              
              {/* Email Field */}
              <div className="flex flex-col sm:flex-row sm:items-center pb-2 gap-2 sm:gap-6">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-32 shrink-0">Comms Link</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
