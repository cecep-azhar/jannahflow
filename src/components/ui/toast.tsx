"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, MessageCircleWarning, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Global state for toasts so we can trigger from anywhere
let toastCounter = 0;
let addToastFunction: ((msg: string, type: ToastType) => void) | null = null;

export const toast = (message: string, type: ToastType = "info") => {
  if (addToastFunction) {
    addToastFunction(message, type);
  }
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastFunction = addToast;
    return () => {
      addToastFunction = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 min-w-[280px] max-w-sm p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-2 fade-in duration-300 ${
              isSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-900/50 dark:text-emerald-100"
                : isError
                ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/80 dark:border-red-900/50 dark:text-red-100"
                : "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/80 dark:border-blue-900/50 dark:text-blue-100"
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              ) : isError ? (
                <MessageCircleWarning className="w-5 h-5 text-red-500 dark:text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              )}
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className={`p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity ${
                isSuccess
                  ? "hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 text-emerald-600 dark:text-emerald-300"
                  : isError
                  ? "hover:bg-red-200/50 dark:hover:bg-red-800/50 text-red-600 dark:text-red-300"
                  : "hover:bg-blue-200/50 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-300"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
