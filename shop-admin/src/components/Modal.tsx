import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  size?: 'default' | 'wide';
  children: ReactNode;
}

export function Modal({ open, onClose, labelledBy, size = 'default', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      data-size={size}
      className="admin-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

export function DialogHeader({
  id,
  eyebrow,
  title,
  description,
  onClose
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-1 font-display text-2xl text-sand-50">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-sand-100/60">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar diálogo"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-sand-100/60 transition hover:border-white/25 hover:text-sand-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </header>
  );
}
