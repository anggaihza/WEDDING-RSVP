"use client";

import {
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type DashboardToastTone = "success" | "error";

type DashboardToast = {
  id: string;
  tone: DashboardToastTone;
  message: string;
};

type DashboardToastContextValue = {
  showToast: (toast: Omit<DashboardToast, "id">) => void;
};

const DashboardToastContext =
  createContext<DashboardToastContextValue | null>(null);

export function DashboardToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<DashboardToast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<DashboardToast, "id">) => {
      const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
      const nextToast = { ...toast, id };

      setToasts((current) => [...current.slice(-2), nextToast]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <DashboardToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toast.tone === "success" ? CheckCircle2 : AlertCircle;

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-3 text-sm shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-950/5",
                toast.tone === "success"
                  ? "border-emerald-200 text-emerald-950"
                  : "border-red-200 text-red-950"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  toast.tone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                <Icon className="size-4" />
              </div>
              <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => removeToast(toast.id)}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </DashboardToastContext.Provider>
  );
}

export function useDashboardToast() {
  const context = useContext(DashboardToastContext);

  if (!context) {
    throw new Error("useDashboardToast must be used within DashboardToastProvider.");
  }

  return context;
}
