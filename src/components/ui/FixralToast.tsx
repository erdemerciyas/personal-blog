'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { ToastItem, ToastVariant, useToast } from './useToast';

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-white border border-slate-200 text-slate-900',
  info: 'bg-brand-primary-50 border border-brand-primary-200 text-brand-primary-900',
  success: 'bg-emerald-50 border border-emerald-200 text-emerald-900',
  warning: 'bg-amber-50 border border-amber-200 text-amber-900',
  danger: 'bg-red-50 border border-red-200 text-red-900',
};

const barStyles: Record<ToastVariant, string> = {
  default: 'bg-slate-300',
  info: 'bg-brand-primary-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: (id: string) => void }) {
  return (
    <div
      role="status"
      className={clsx(
        'relative w-full sm:w-[380px] rounded-fixral-lg shadow-fixral-lg p-4 pr-10 transition-transform duration-300 will-change-transform',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2',
        variantStyles[toast.variant || 'default']
      )}
      tabIndex={0}
    >
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-fixral text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {toast.title && <div className="text-sm font-semibold mb-1">{toast.title}</div>}
      {toast.description && <div className="text-sm leading-5">{toast.description}</div>}

      {typeof toast.duration === 'number' && toast.duration > 0 && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/50 overflow-hidden">
          <div
            className={clsx('h-full w-full origin-left animate-[shrink_linear] rounded-full', barStyles[toast.variant || 'default'])}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}

const FixralToastViewport: React.FC = () => {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = React.useState(false);

  // Hydration guard: sadece client mount olduktan sonra render et
  React.useEffect(() => {
    setMounted(true);

    // keyframes için style tag'ini güvenle client'ta enjekte et
    const id = 'fixral-toast-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.innerHTML = `@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }`;
      document.head.appendChild(style);
    }
  }, []);

  if (!mounted) return null;
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[120] flex flex-col items-end gap-3 p-4 sm:p-6">
      <div className="ml-auto flex w-full max-w-[380px] flex-col gap-3 pointer-events-auto">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={dismiss} />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default FixralToastViewport;
