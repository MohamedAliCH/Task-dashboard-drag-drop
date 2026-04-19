import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema } from "../lib/schema";
import { useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" },
  { value: "medium", label: "Medium", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" },
  { value: "high",   label: "High",   dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" },
];

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
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

export default function TaskFormModal({ isOpen, onClose, onAddTask, onEditTask, editTask = null }) {
  const isEditMode = editTask !== null;

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
    const payload = { title: data.title.trim(), description: data.description?.trim() || "", priority: data.priority, due: data.due || "No due date" };
    if (isEditMode) {
      await onEditTask({ ...editTask, ...payload });
    } else {
      await onAddTask(payload);
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative glass-panel w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent">
              {isEditMode ? "Edit Task" : "New Task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-6 space-y-5">
            {/* Title */}
            <Field label="Title" error={errors.title}>
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                className={`glass-input ${errors.title ? "border-red-500 focus:ring-red-500/50" : ""}`}
                {...register("title")}
              />
            </Field>

            {/* Description */}
            <Field label="Description" error={errors.description}>
              <textarea
                rows={3}
                placeholder="Add more context or notes (optional)"
                className={`glass-input resize-none ${errors.description ? "border-red-500 focus:ring-red-500/50" : ""}`}
                {...register("description")}
              />
            </Field>

            {/* Priority */}
            <Field label="Priority" error={errors.priority}>
              <div className="grid grid-cols-3 gap-2 border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = selectedPriority === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer transition-all duration-300 text-sm font-semibold select-none ${
                        selected
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                      }`}
                    >
                      <input type="radio" value={opt.value} className="sr-only" {...register("priority")} />
                      <span className={`w-2.5 h-2.5 rounded-full z-10 ${opt.dot} shrink-0`} />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </Field>

            {/* Due Date */}
            <Field label="Due date" error={errors.due}>
              <input
                type="date"
                className={`glass-input ${errors.due ? "border-red-500 focus:ring-red-500/50" : ""}`}
                {...register("due")}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/10 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 glass-button py-2.5 px-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
