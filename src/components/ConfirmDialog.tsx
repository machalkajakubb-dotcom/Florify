"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = true,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center">
        <div className="text-4xl mb-2">{danger ? "⚠️" : "❓"}</div>
        <h3 className="font-display font-bold text-lg text-bark-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-stone-500 dark:text-gray-400 mt-2 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-2xl font-semibold text-sm transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600 text-white" : "bg-forest-600 hover:bg-forest-700 text-white"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
