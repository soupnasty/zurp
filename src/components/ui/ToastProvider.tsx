"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface Toast {
  id: string;
  message: string;
  onUndo?: () => void;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, onUndo?: () => void) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, onUndo?: () => void) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, onUndo }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3 shadow-[var(--glow-sm)] animate-in fade-in slide-in-from-bottom-2"
            >
              <span className="text-[var(--text-body)] text-[var(--text-primary)]">
                {toast.message}
              </span>
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.();
                    removeToast(toast.id);
                  }}
                  className="text-[var(--text-body)] font-medium text-[var(--accent)] hover:underline"
                >
                  Undo
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
