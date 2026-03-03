type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onClick?: () => void;
}

const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify() {
  for (const fn of listeners) fn([...toasts]);
}

export function toast(
  message: string,
  type: ToastType = "info",
  duration = 3500,
  onClick?: () => void,
) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type, onClick }];
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, duration);
}

export function subscribeToasts(fn: (toasts: Toast[]) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export type { Toast, ToastType };
