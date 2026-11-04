import { Plus, X } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { ProductFormValues } from '../product-form-schema';
import { FieldError } from './FieldError';

interface ProductColorsFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

export function ProductColorsField({ form }: ProductColorsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'colors' });
  const errors = form.formState.errors;

  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <span className="field-label">Colores</span>
        <button
          type="button"
          onClick={() => append({ name: '', hex: '#1f2328' })}
          disabled={fields.length >= 6}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-sand-100/70 transition hover:border-white/25 hover:text-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Agregar color
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <input
              type="color"
              aria-label={`Color ${index + 1} hexadecimal`}
              className="mt-0.5 h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-white/15 bg-ink-900 p-1"
              {...form.register(`colors.${index}.hex`)}
            />
            <div className="flex-1">
              <input
                aria-label={`Color ${index + 1} nombre`}
                className="field"
                placeholder="Nombre del color"
                {...form.register(`colors.${index}.name`)}
              />
              <FieldError
                id={`color-${index}-error`}
                message={
                  errors.colors?.[index]?.name?.message ?? errors.colors?.[index]?.hex?.message
                }
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={`Quitar color ${index + 1}`}
              className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-sand-100/50 transition hover:border-rose-300/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <FieldError id="colors-error" message={errors.colors?.message} />
    </div>
  );
}
