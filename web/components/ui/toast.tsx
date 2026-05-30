"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "warning";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border",
  success: "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  error: "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200",
  warning: "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
};

export function Toast({ open, onClose, title, description, variant = "default" }: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-2 fade-in-0">
      <div
        className={cn(
          "rounded-lg border-2 bg-background px-4 py-3 shadow-lg transition-all duration-200 max-w-sm",
          variantStyles[variant]
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold">{title}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: string } & Omit<ToastProps, "open" | "onClose">>>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "open" | "onClose">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
