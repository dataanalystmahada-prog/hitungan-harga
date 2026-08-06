import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    const handleBeforePrint = () => {
      document.body.style.overflow = 'visible';
    };

    const handleAfterPrint = () => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:static print:p-0 print:overflow-visible print:block printable-modal-wrapper">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150',
          'print:static print:max-h-none print:overflow-visible print:border-none print:shadow-none print:bg-transparent print:p-0 print:m-0 print:w-full print:animate-none print:rounded-none',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 print:p-0 print:overflow-visible print:h-auto print:max-h-none">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
