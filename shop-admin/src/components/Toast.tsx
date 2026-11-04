import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="animate-fade-up fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-signal-400/30 bg-ink-800/95 px-4 py-3 text-sm text-sand-50 shadow-2xl backdrop-blur sm:right-6 sm:bottom-6"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-signal-400" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sand-100/50 transition hover:bg-white/10 hover:text-sand-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
