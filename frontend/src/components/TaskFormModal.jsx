import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema } from "../lib/schema";
import { useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

const PRIORITIES = [
  { value: "low",    label: "Low",    dot: "bg-emerald-500" },
  { value: "medium", label: "Medium", dot: "bg-amber-400" },
  { value: "high",   label: "High",   dot: "bg-red-500" },
];

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
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

export default function TaskFormModal({ isOpen, onClose, onAddTask, onEditTask, editTask = null }) {
  const isEdit = editTask !== null;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", priority: "", due: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        editTask
          ? { title: editTask.title, description: editTask.description || "", priority: editTask.priority, due: editTask.due?.slice(0, 10) || "" }
          : { title: "", description: "", priority: "", due: "" }
      );
    }
  }, [isOpen, editTask, reset]);

  const selectedPriority = watch("priority");

  const onSubmit = async (data) => {
    const payload = {
      title: data.title.trim(),
      description: data.description?.trim() || "",
      priority: data.priority,
      due: data.due || "No due date",
    };
    if (isEdit) {
      await onEditTask({ ...editTask, ...payload });
    } else {
      await onAddTask(payload);
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-panel w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/40 dark:border-white/[0.06] shrink-0">
          <h2 className="text-lg font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-5 space-y-5">
            <Field label="Title" error={errors.title}>
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                className={`glass-input ${errors.title ? "ring-2 ring-red-500/40 border-red-500/50" : ""}`}
                {...register("title")}
              />
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea
                rows={3}
                placeholder="Add context or notes (optional)"
                className={`glass-input resize-none ${errors.description ? "ring-2 ring-red-500/40 border-red-500/50" : ""}`}
                {...register("description")}
              />
            </Field>

            <Field label="Priority" error={errors.priority}>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/[0.06]">
                {PRIORITIES.map((opt) => {
                  const sel = selectedPriority === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer text-sm font-medium select-none transition-all duration-200 ${
                        sel
                          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <input type="radio" value={opt.value} className="sr-only" {...register("priority")} />
                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label="Due date" error={errors.due}>
              <input
                type="date"
                className={`glass-input ${errors.due ? "ring-2 ring-red-500/40 border-red-500/50" : ""}`}
                {...register("due")}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200/40 dark:border-white/[0.06] flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200/60 dark:border-white/10 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 glass-button py-2.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
