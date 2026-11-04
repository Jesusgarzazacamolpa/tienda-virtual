import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { DialogHeader, Modal } from '@/components/Modal';
import type { Product, ProductInput } from '@/models/catalog';

import type { ProductFormValues } from '../product-form-schema';
import { productFormSchema, toFormValues } from '../product-form-schema';
import { ProductFormFields } from './ProductFormFields';

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  pending: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}

export function ProductFormDialog({
  open,
  product,
  pending,
  serverError,
  onClose,
  onSubmit
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product)
  });

  useEffect(() => {
    if (!open) return;
    form.reset(toFormValues(product));
  }, [open, product, form]);

  const submit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      badge: values.badge.length > 0 ? values.badge : null,
      compareAtPrice: values.compareAtPrice ?? null
    });
  });

  return (
    <Modal open={open} onClose={onClose} labelledBy="product-dialog-title" size="wide">
      <DialogHeader
        id="product-dialog-title"
        eyebrow={product ? 'Editar producto' : 'Nuevo producto'}
        title={product ? product.name : 'Agregar al catálogo'}
        description={
          product
            ? 'Los cambios se reflejan de inmediato en la tienda.'
            : 'Completa la ficha para publicar un producto en la tienda.'
        }
        onClose={onClose}
      />

      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <ProductFormFields form={form} />

          {serverError ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {serverError}
            </p>
          ) : null}

          {form.formState.errors.root?.message ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
            >
              {form.formState.errors.root.message}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={onClose} disabled={pending} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
