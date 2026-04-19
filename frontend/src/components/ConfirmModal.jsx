import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative glass-panel w-full max-w-sm p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-400" />
        <div className="flex items-start gap-4 mt-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
              {title || "Confirm Action"}
            </h3>
            {message && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-8 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
