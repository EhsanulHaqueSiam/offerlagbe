import { useState, useEffect } from "react";
import { subscribeToasts, type Toast } from "@/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={t.onClick}
          className={`animate-fade-in-up pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl backdrop-blur-lg border ${
            t.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : t.type === "error"
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : "bg-slate-700/80 text-slate-200 border-slate-600/30"
          } ${t.onClick ? "cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all" : ""}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
