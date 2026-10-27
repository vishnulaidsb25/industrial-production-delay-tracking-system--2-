import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-sm transition-all duration-200 bg-white ${
            toast.type === 'success'
              ? 'border-emerald-200 text-slate-900'
              : toast.type === 'warning'
              ? 'border-amber-200 text-slate-900'
              : toast.type === 'error'
              ? 'border-red-200 text-slate-900'
              : 'border-blue-200 text-slate-900'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
          </div>
          <div className="flex-1 font-medium">{toast.message}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
