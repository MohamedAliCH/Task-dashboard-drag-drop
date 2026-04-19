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
    (async () => {
      try {
        const res = await api.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
        else toast.error("Failed to load analytics.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-aurora-1" />
      </div>
    );
  }

  const total       = tasks.length;
  const completed   = tasks.filter((t) => t.status === "done").length;
  const todo        = tasks.filter((t) => t.status === "todo").length;
  const inProgress  = tasks.filter((t) => t.status === "inProgress").length;
  const rate        = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue     = tasks.filter((t) => {
    if (!t.due || t.due === "No due date" || t.status === "done") return false;
    return new Date(t.due) < new Date(new Date().toDateString());
  }).length;
  const priority    = { high: 0, medium: 0, low: 0 };
  tasks.forEach((t) => { if (priority[t.priority] !== undefined) priority[t.priority]++; });

  /* ── Bar helper ───────────────────────────────────────── */
  function Bar({ label, count, max, color }) {
    const pct = max > 0 ? (count / max) * 100 : 0;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{count}</span>
        </div>
        <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
          <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="page-container py-6 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Task data and distribution</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total",     value: total,     icon: ListTodo,     accent: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" },
            { label: "Completed", value: completed,  icon: CheckCircle2, accent: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
            { label: "Done Rate", value: `${rate}%`, icon: BarChart3,    accent: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400" },
            { label: "Overdue",   value: overdue,    icon: AlertCircle,  accent: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Side-by-side breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="glass-panel p-5 flex flex-col gap-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ListTodo className="w-4 h-4 text-aurora-1" /> By status
            </h3>
            <div className="space-y-4">
              <Bar label="To do"        count={todo}       max={total} color="bg-slate-400" />
              <Bar label="In progress"  count={inProgress} max={total} color="bg-amber-400" />
              <Bar label="Done"         count={completed}  max={total} color="bg-emerald-500" />
            </div>
          </div>

          {/* Priority */}
          <div className="glass-panel p-5 flex flex-col gap-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Flag className="w-4 h-4 text-aurora-1" /> By priority
            </h3>
            <div className="space-y-4">
              <Bar label="High"   count={priority.high}   max={total} color="bg-red-500" />
              <Bar label="Medium" count={priority.medium} max={total} color="bg-amber-400" />
              <Bar label="Low"    count={priority.low}    max={total} color="bg-emerald-500" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
