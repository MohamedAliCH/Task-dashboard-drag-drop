import {
  Trash2,
  Pencil,
  Calendar,
  Flag,
  GripVertical,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlignLeft,
} from "lucide-react";

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    borderColor: "border-l-red-500",
    badgeBg: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50",
    icon: <ArrowUp className="w-3 h-3" />,
    dotColor: "bg-red-500",
  },
  medium: {
    label: "Medium",
    borderColor: "border-l-yellow-500",
    badgeBg: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50",
    icon: <ArrowRight className="w-3 h-3" />,
    dotColor: "bg-yellow-500",
  },
  low: {
    label: "Low",
    borderColor: "border-l-green-500",
    badgeBg: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50",
    icon: <ArrowDown className="w-3 h-3" />,
    dotColor: "bg-green-500",
  },
};

function isOverdue(due) {
  if (!due || due === "No due date") return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function formatDate(due) {
  if (!due || due === "No due date") return "No due date";
  const date = new Date(due);
  if (isNaN(date)) return due;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskCard({ task, onDelete, onEdit }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
  const overdue = isOverdue(task.due);

  return (
    <div
      className={`
          group relative bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700
          border-l-4 ${priority.borderColor}
          hover:shadow-md hover:-translate-y-0.5
          transition-all duration-200
          cursor-grab active:cursor-grabbing
        `}
    >
      {/* Drag handle indicator */}
      <div className="absolute top-3 right-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="p-4">
        {/* Title */}
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug pr-6 mb-3">
          {task.title}
        </p>

        {/* Priority badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${priority.badgeBg}`}
          >
            <Flag className="w-3 h-3" />
            {priority.label}
          </span>
          {task.description && (
            <span 
              className="flex items-center justify-center ml-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
              title="Has description"
            >
              <AlignLeft className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Footer: due date + actions */}
        <div className="flex items-center justify-between mt-1">
          {/* Due date */}
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              overdue
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {overdue ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Calendar className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {overdue
                ? `Overdue · ${formatDate(task.due)}`
                : formatDate(task.due)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                onPointerDown={(e) => e.stopPropagation()}
                title="Edit task"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                onPointerDown={(e) => e.stopPropagation()}
                title="Delete task"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
