'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className={`
        ${getBackgroundColor()} ${getTextColor()}
        border rounded-xl shadow-lg p-4
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">
              {title}
            </h4>
            {message && (
              <p className="text-sm mt-1 opacity-90">
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}