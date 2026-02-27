'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-white text-emerald-700 border-emerald-200/60',
    error: 'bg-white text-red-700 border-red-200/60',
    info: 'bg-white text-primary-700 border-primary-200/60',
  };

  const iconBg = {
    success: 'bg-emerald-50',
    error: 'bg-red-50',
    info: 'bg-primary-50',
  };

  const accentColor = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-primary-500',
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-3 pl-1 pr-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 min-w-[300px]',
        styles[type],
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      )}
    >
      {/* Accent bar */}
      <div className={clsx('w-1 h-8 rounded-full ml-2', accentColor[type])} />

      <div className={clsx('p-1.5 rounded-lg', iconBg[type])}>
        {icons[type]}
      </div>
      <span className="text-sm font-medium flex-grow">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-1 p-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-3.5 h-3.5 text-dark-300" />
      </button>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
