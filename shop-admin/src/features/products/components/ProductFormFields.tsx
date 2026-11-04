import { ChevronRight } from 'lucide-react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { CATEGORY_LABELS } from '@/lib/format';
import type { Category } from '@/models/catalog';
import { CATEGORIES } from '@/models/catalog';

import type { ProductFormValues } from '../product-form-schema';
import { IMAGE_SUGGESTIONS } from '../product-form-schema';
import { FieldError } from './FieldError';
import { ProductColorsField } from './ProductColorsField';

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export function ProductFormFields({ form }: ProductFormFieldsProps) {
  const {
    register,
    formState: { errors }
  } = form;
  const imagePreview = useWatch({ control: form.control, name: 'image' });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="product-name" className="field-label">
          Nombre
        </label>
        <input
          id="product-name"
          className="field mt-2"
          placeholder="Aura Studio"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'product-name-error' : undefined}
          {...register('name')}
        />
        <FieldError id="product-name-error" message={errors.name?.message} />
      </div>

      <div>
        <label htmlFor="product-category" className="field-label">
          Categoría
        </label>
        <div className="relative mt-2">
          <select
            id="product-category"
            className="field appearance-none pr-10"
            {...register('category')}
          >
            {CATEGORIES.map((category: Category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          <ChevronRight
            className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 rotate-90 text-sand-100/40"
            aria-hidden="true"
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-badge" className="field-label">
          Etiqueta <span className="normal-case text-sand-100/40">(opcional)</span>
        </label>
        <input
          id="product-badge"
          className="field mt-2"
          placeholder="Más vendido"
          aria-invalid={Boolean(errors.badge)}
          aria-describedby={errors.badge ? 'product-badge-error' : undefined}
          {...register('badge')}
        />
        <FieldError id="product-badge-error" message={errors.badge?.message} />
      </div>

      <div>
        <label htmlFor="product-price" className="field-label">
          Precio (MXN)
        </label>
        <input
          id="product-price"
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          className="field mt-2"
          aria-invalid={Boolean(errors.price)}
          aria-describedby={errors.price ? 'product-price-error' : undefined}
          {...register('price', { valueAsNumber: true })}
        />
        <FieldError id="product-price-error" message={errors.price?.message} />
      </div>

      <div>
        <label htmlFor="product-compare-price" className="field-label">
          Precio anterior <span className="normal-case text-sand-100/40">(opcional)</span>
        </label>
        <input
          id="product-compare-price"
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          className="field mt-2"
          placeholder="Sin descuento"
          aria-invalid={Boolean(errors.compareAtPrice)}
          aria-describedby={errors.compareAtPrice ? 'product-compare-price-error' : undefined}
          {...register('compareAtPrice', {
            setValueAs: (value: string | null) =>
              value === '' || value === null ? null : Number(value)
          })}
        />
        <FieldError id="product-compare-price-error" message={errors.compareAtPrice?.message} />
      </div>

      <div>
        <label htmlFor="product-stock" className="field-label">
          Stock
        </label>
        <input
          id="product-stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          className="field mt-2"
          aria-invalid={Boolean(errors.stock)}
          aria-describedby={errors.stock ? 'product-stock-error' : undefined}
          {...register('stock', { valueAsNumber: true })}
        />
        <FieldError id="product-stock-error" message={errors.stock?.message} />
      </div>

      <div className="flex items-end">
        <label className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span>
            <span className="block text-sm font-medium text-sand-50">Producto activo</span>
            <span className="block text-xs text-sand-100/45">Visible en la tienda</span>
          </span>
          <input type="checkbox" className="peer sr-only" {...register('active')} />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-sand-50 after:transition peer-checked:bg-signal-400 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-signal-400/40" />
        </label>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-image" className="field-label">
          Imagen
        </label>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-ink-950">
            <img src={imagePreview} alt="" className="h-full w-full object-cover" />
          </div>
          <input
            id="product-image"
            list="product-image-options"
            className="field font-mono text-xs"
            placeholder="/products/aura-studio.webp"
            aria-invalid={Boolean(errors.image)}
            aria-describedby={errors.image ? 'product-image-error' : undefined}
            {...register('image')}
          />
        </div>
        <datalist id="product-image-options">
          {IMAGE_SUGGESTIONS.map((path) => (
            <option key={path} value={path} />
          ))}
        </datalist>
        <FieldError id="product-image-error" message={errors.image?.message} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-tagline" className="field-label">
          Descripción corta
        </label>
        <input
          id="product-tagline"
          className="field mt-2"
          placeholder="Audífonos de diadema con cancelación activa"
          aria-invalid={Boolean(errors.tagline)}
          aria-describedby={errors.tagline ? 'product-tagline-error' : undefined}
          {...register('tagline')}
        />
        <FieldError id="product-tagline-error" message={errors.tagline?.message} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-description" className="field-label">
          Descripción
        </label>
        <textarea
          id="product-description"
          rows={4}
          className="field mt-2 resize-y"
          placeholder="Materiales, beneficios y detalles del producto…"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'product-description-error' : undefined}
          {...register('description')}
        />
        <FieldError id="product-description-error" message={errors.description?.message} />
      </div>

      <ProductColorsField form={form} />
    </div>
  );
}
