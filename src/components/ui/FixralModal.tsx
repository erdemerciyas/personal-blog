import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface FixralModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  ariaDescribedBy?: string;
}

const sizeClasses: Record<NonNullable<FixralModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FixralModal: React.FC<FixralModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
  ariaDescribedBy,
}) => {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Mount portal on client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manage focus when opening/closing
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      // Slight delay to ensure elements exist
      setTimeout(() => {
        const el = dialogRef.current;
        if (!el) return;
        // Focus first focusable element inside
        const focusable = el.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || el).focus();
      }, 0);
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  }, [open]);

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => closeOnOverlay && onClose()}
        aria-hidden
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'fixral-modal-title' : undefined}
        aria-describedby={ariaDescribedBy}
        className={clsx(
          'relative z-[101] w-full rounded-fixral-xl bg-white dark:bg-slate-800 shadow-fixral-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2',
          sizeClasses[size]
        )}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200 dark:border-slate-700">
            {title && (
              <h2 id="fixral-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-fixral text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 md:p-6 text-slate-800 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default FixralModal;
