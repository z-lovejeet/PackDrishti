import React from 'react';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const borderColors = {
          success: 'border-l-4 border-l-success',
          error: 'border-l-4 border-l-violation',
          warning: 'border-l-4 border-l-warning',
          info: 'border-l-4 border-l-primary',
        };

        const icons = {
          success: <CheckCircle size={20} weight="bold" className="text-success shrink-0" />,
          error: <XCircle size={20} weight="bold" className="text-violation shrink-0" />,
          warning: <Warning size={20} weight="bold" className="text-warning shrink-0" />,
          info: <Info size={20} weight="bold" className="text-primary shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border border-neutral-200 rounded-[6px] p-3.5 shadow-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${borderColors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-neutral-900 font-heading">{toast.title}</h4>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
