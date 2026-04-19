import { Trash2, Pencil, Calendar, GripVertical, AlertCircle, AlignLeft } from "lucide-react";

const PRIORITY_CONFIG = {
  high:   { label: "High",   dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",    badge: "text-red-500 bg-red-50 dark:bg-red-500/10" },
  medium: { label: "Medium", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",  badge: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  low:    { label: "Low",    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", badge: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
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
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
  const overdue = isOverdue(task.due);
  const dateStr = formatDate(task.due);

  return (
    <div className="group relative glass-card cursor-grab active:cursor-grabbing overflow-hidden hover:-translate-y-1 hover:rotate-1">
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-2 h-2 rounded-full shrink-0 ${priority.dot}`} />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
              {task.title}
            </p>
          </div>
          <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </div>

        {/* Description indicator */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed ml-4">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200/50 dark:border-white/5 ml-4">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${priority.badge}`}>
              {priority.label}
            </span>

            {/* Due date */}
            {dateStr && (
              <span className={`flex items-center gap-1.5 text-xs font-medium ${
                overdue ? "text-red-500" : "text-slate-500 dark:text-slate-400"
              }`}>
                {overdue
                  ? <AlertCircle className="w-3 h-3 shrink-0" />
                  : <Calendar className="w-3 h-3 shrink-0" />
                }
                {dateStr}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                onPointerDown={(e) => e.stopPropagation()}
                title="Edit"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-aurora-3 hover:bg-aurora-3/10 transition-colors"
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
    </div>
  );
}
