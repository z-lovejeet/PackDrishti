import React from 'react';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';
import { clsx } from 'clsx';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const borderStyles = {
          success: 'border-l-4 border-l-success',
          error: 'border-l-4 border-l-violation',
          warning: 'border-l-4 border-l-warning',
          info: 'border-l-4 border-l-navy-800',
        };

        const iconContainerStyles = {
          success: 'bg-success-light text-success border-success-border',
          error: 'bg-violation-light text-violation border-violation-border',
          warning: 'bg-warning-light text-saffron-600 border-warning-border',
          info: 'bg-navy-50 text-navy-800 border-navy-200',
        };

        const icons = {
          success: <CheckCircle size={18} weight="bold" />,
          error: <XCircle size={18} weight="bold" />,
          warning: <Warning size={18} weight="bold" />,
          info: <Info size={18} weight="bold" />,
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className={clsx(
              'pointer-events-auto bg-white border border-neutral-200 rounded-card p-3.5 shadow-dropdown flex items-start gap-3 transition-all animate-slideUp',
              borderStyles[toast.type]
            )}
          >
            <div
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-md border shrink-0',
                iconContainerStyles[toast.type]
              )}
            >
              {icons[toast.type]}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-xs font-bold text-neutral-900 font-heading leading-tight">
                {toast.title}
              </h4>
              <p className="text-2xs text-neutral-600 mt-1 leading-normal font-sans">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1 rounded-md transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-navy-800 shrink-0 -mt-0.5 -mr-0.5"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
