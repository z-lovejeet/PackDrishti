import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  icon,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={subtitle ? 'modal-subtitle' : undefined}
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={clsx(
          'relative w-full bg-white rounded-card border border-neutral-200 shadow-modal overflow-hidden z-10 flex flex-col max-h-[90vh] animate-slideUp',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/75">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-50 text-navy-800 border border-navy-200 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3
                id="modal-title"
                className="text-base sm:text-lg font-bold text-neutral-900 font-heading truncate"
              >
                {title}
              </h3>
              {subtitle && (
                <p id="modal-subtitle" className="text-xs text-neutral-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-navy-800 shrink-0 ml-2"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto text-sm text-neutral-700 leading-relaxed">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50/80 flex items-center justify-end gap-3 rounded-b-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
