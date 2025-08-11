'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: ToastItem[];
  show: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const full: ToastItem = { variant: 'default', duration: 4000, ...toast, id };
    setToasts((prev) => [full, ...prev]);
    if (full.duration && full.duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), full.duration);
    }
    return id;
  }, [dismiss]);

  const clear = useCallback(() => {
    setToasts([]);
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }, []);

  const value = useMemo(() => ({ toasts, show, dismiss, clear }), [toasts, show, dismiss, clear]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
