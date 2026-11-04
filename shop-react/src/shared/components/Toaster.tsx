import { CheckCircle2, X } from 'lucide-react';

import { useToastStore } from '@/store/toast-store';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-signal-400/30 bg-ink-800/95 px-4 py-3 text-sm text-sand-50 shadow-2xl backdrop-blur"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-signal-400" aria-hidden="true" />
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Cerrar aviso"
            className="grid h-7 w-7 place-items-center rounded-full text-sand-100/50 transition hover:bg-white/10 hover:text-sand-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
