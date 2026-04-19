import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { toast } from "react-toastify";
import { BarChart3, CheckCircle2, ListTodo, AlertCircle, Flag, Loader2 } from "lucide-react";

export default function Stats() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load stats data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50 dark:bg-industrial-900">
        <Loader2 className="w-8 h-8 text-industrial-900 dark:text-industrial-100 animate-spin" />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "inProgress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = tasks.filter((t) => {
    if (!t.due || t.due === "No due date") return false;
    return new Date(t.due) < new Date(new Date().toDateString());
  }).length;

  const priorityCounts = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  return (
    <div className="flex-1 animate-page-in">
      <div className="page-container py-8 flex flex-col gap-6 mx-auto max-w-5xl">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent tracking-tight">System Analytics</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Data tracking and distribution</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Total Tasks", value: totalTasks, icon: <ListTodo className="w-5 h-5 text-slate-700 dark:text-slate-200" />, color: "bg-slate-100 dark:bg-slate-800" },
            { label: "Completed", value: completedTasks, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, color: "bg-emerald-100 dark:bg-emerald-900/40" },
            { label: "Done Rate", value: `${completionRate}%`, icon: <BarChart3 className="w-5 h-5 text-aurora-1" />, color: "bg-sky-100 dark:bg-sky-900/40" },
            { label: "Overdue", value: overdueTasks, icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />, color: "bg-red-100 dark:bg-red-900/40" },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-5 flex flex-col hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Status Breakdown */}
          <div className="glass-panel p-6 flex flex-col gap-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              <ListTodo className="w-4 h-4 text-aurora-1" /> Tasks by status
            </h3>
            
            <div className="space-y-5">
              {[
                { label: "To do", count: todoTasks, color: "bg-slate-400" },
                { label: "In progress", count: inProgressTasks, color: "bg-amber-400" },
                { label: "Done", count: completedTasks, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden border border-slate-300/30 dark:border-white/10">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${totalTasks ? (item.count/totalTasks)*100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="glass-panel p-6 flex flex-col gap-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              <Flag className="w-4 h-4 text-aurora-1" /> Tasks by priority
            </h3>
            
            <div className="space-y-5">
              {[
                { label: "High", count: priorityCounts.high, color: "bg-red-500" },
                { label: "Medium", count: priorityCounts.medium, color: "bg-amber-400" },
                { label: "Low", count: priorityCounts.low, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden border border-slate-300/30 dark:border-white/10">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${totalTasks ? (item.count/totalTasks)*100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
