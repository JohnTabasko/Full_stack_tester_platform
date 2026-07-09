import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 size={16} className="text-green-500" />,
    error: <X size={16} className="text-destructive" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    info: <Info size={16} className="text-blue-400" />,
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border text-sm animate-slide-up transition-all',
              'bg-card border-border'
            )}
            style={{
              transform: `translateY(${-index * 4}px)`,
              zIndex: 50 - index,
            }}
          >
            {icons[toast.type]}
            <span className="text-foreground">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-0.5 rounded hover:bg-accent transition-colors"
            >
              <X size={13} className="text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}