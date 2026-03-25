import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema } from "../lib/schema";
import { useEffect } from "react";
import {
  X,
  Type,
  AlignLeft,
  Flag,
  Calendar,
  Plus,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Low",
    color: "text-green-700 bg-green-50 border-green-300",
    dot: "bg-green-500",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-yellow-700 bg-yellow-50 border-yellow-300",
    dot: "bg-yellow-500",
  },
  {
    value: "high",
    label: "High",
    color: "text-red-700 bg-red-50 border-red-300",
    dot: "bg-red-500",
  },
];

// editTask = null  →  create mode
// editTask = {...} →  edit mode
export default function TaskFormModal({
  isOpen,
  onClose,
  onAddTask,
  onEditTask,
  editTask = null,
}) {
  const isEditMode = editTask !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      due: "",
    },
  });

  const selectedPriority = watch("priority");

  // Pre-fill form when switching into edit mode, clear when closing
  useEffect(() => {
    if (isOpen && isEditMode) {
      reset({
        title: editTask.title ?? "",
        description: editTask.description ?? "",
        priority: editTask.priority ?? "",
        due: editTask.due && editTask.due !== "No due date" ? editTask.due : "",
      });
    } else if (!isOpen) {
      reset({ title: "", description: "", priority: "", due: "" });
    }
  }, [isOpen, isEditMode, editTask, reset]);

  const onSubmit = (data) => {
    const taskData = {
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      due: data.due || "No due date",
    };

    if (isEditMode) {
      onEditTask({ ...taskData, _id: editTask._id, id: editTask.id });
    } else {
      onAddTask(taskData);
    }

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
              {isEditMode ? (
                <Pencil className="w-5 h-5 text-indigo-600" />
              ) : (
                <Plus className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? "Edit Task" : "New Task"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEditMode
                  ? "Update the task details below"
                  : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Type className="w-3.5 h-3.5 text-gray-400" />
              Task Title
              <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Design landing page mockup"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? "border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-400 focus:border-indigo-400"
              }`}
              {...register("title")}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
              Description
              <span className="text-xs text-gray-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              id="description"
              placeholder="Add details about this task..."
              rows={3}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.description
                  ? "border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-400 focus:border-indigo-400"
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Flag className="w-3.5 h-3.5 text-gray-400" />
              Priority
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_OPTIONS.map(({ value, label, color, dot }) => (
                <label
                  key={value}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 border-2 rounded-xl cursor-pointer text-sm font-semibold transition-all select-none ${
                    selectedPriority === value
                      ? color + " border-current shadow-md scale-[1.02]"
                      : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register("priority")}
                  />
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      selectedPriority === value ? dot : "bg-gray-300"
                    }`}
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.priority && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="due"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Due Date
              <span className="text-xs text-gray-400 font-normal ml-1">
                (optional)
              </span>
            </label>
            <input
              id="due"
              type="date"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all ${
                errors.due
                  ? "border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-400 focus:border-indigo-400"
              }`}
              {...register("due")}
            />
            {errors.due && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.due.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                <>
                  <Pencil className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
