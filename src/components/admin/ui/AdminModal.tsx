'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AdminButton from './AdminButton';

export type AdminModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: AdminModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  children,
}: AdminModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4 sm:mx-8',
  };

  const mobileFullScreen = size === 'full' ? 'sm:max-h-[90vh] max-h-screen sm:rounded-xl rounded-none' : 'max-h-[90vh]';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white dark:bg-slate-800 shadow-2xl w-full flex flex-col animate-scale',
          sizeClasses[size],
          mobileFullScreen
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3
              id="modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
