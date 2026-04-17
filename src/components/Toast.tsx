"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `t_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle2 size={18} color="var(--secondary)" />,
    error: <XCircle size={18} color="#EF4444" />,
    info: <Info size={18} color="var(--primary)" />,
  };

  const colors = {
    success: "var(--secondary)",
    error: "#EF4444",
    info: "var(--primary)",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{ borderLeftColor: colors[t.type] }}>
            {icons[t.type]}
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--charcoal)" }}>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)", display: "flex", padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
