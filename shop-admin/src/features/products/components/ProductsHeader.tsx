import { Plus } from 'lucide-react';

interface ProductsHeaderProps {
  onCreate: () => void;
}

export function ProductsHeader({ onCreate }: ProductsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-2 font-display text-3xl text-sand-50 sm:text-4xl">Productos</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand-100/60">
          Gestiona el inventario que ve la tienda. Puedes crear fichas, ajustar precios y
          despublicar productos sin salir del panel.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="btn-primary shrink-0 self-start sm:self-auto"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Nuevo producto
      </button>
    </header>
  );
}
