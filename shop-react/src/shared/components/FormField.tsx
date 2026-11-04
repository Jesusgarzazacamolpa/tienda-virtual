import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, id, className, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name ?? label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-sand-100/80">
        {label}
        {inputProps.required && (
          <span className="ml-1 text-signal-300" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        {...inputProps}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={cn('field mt-2', error && 'field-invalid', className)}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-sand-100/40">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
