import { Trash2, Pencil, Calendar, GripVertical, AlertCircle } from "lucide-react";

const PRIORITY = {
  high:   { label: "High",   dot: "bg-red-500",     badge: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10" },
  medium: { label: "Medium", dot: "bg-amber-400",   badge: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" },
  low:    { label: "Low",    dot: "bg-emerald-500", badge: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
};

function isOverdue(due) {
  if (!due || due === "No due date") return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function formatDate(due) {
  if (!due || due === "No due date") return null;
  const d = new Date(due);
  if (isNaN(d)) return due;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TaskCard({ task, onDelete, onEdit }) {
  const p = PRIORITY[task.priority] ?? PRIORITY.low;
  const overdue = isOverdue(task.due);
  const date = formatDate(task.due);

  return (
    <div className="group glass-card p-4 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md">
      {/* Title row */}
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${p.dot}`} />
        <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
          {task.title}
        </p>
        <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 ml-5 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/40 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md ${p.badge}`}>
            {p.label}
          </span>
          {date && (
            <span className={`flex items-center gap-1 text-xs font-medium ${
              overdue ? "text-red-500" : "text-slate-400 dark:text-slate-500"
            }`}>
              {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {date}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              onPointerDown={(e) => e.stopPropagation()}
              title="Edit"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-aurora-1 hover:bg-aurora-1/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              onPointerDown={(e) => e.stopPropagation()}
              title="Delete"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
