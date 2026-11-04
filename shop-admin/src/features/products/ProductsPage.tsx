import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

import { PanelMessage } from '@/components/PanelMessage';
import { Toast } from '@/components/Toast';
import { normalizeText } from '@/lib/text';
import type { Product, ProductInput } from '@/models/catalog';
import { useAdminApi } from '@/session/use-admin-api';

import { ProductFormDialog } from './components/ProductFormDialog';
import type { ProductMetrics } from './components/ProductsStats';
import { ProductsCards } from './components/ProductsCards';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsSkeleton } from './components/ProductsSkeleton';
import { ProductsStats } from './components/ProductsStats';
import { ProductsTable } from './components/ProductsTable';
import type { CategoryFilter } from './components/ProductsToolbar';
import { ProductsToolbar } from './components/ProductsToolbar';

type DialogState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

export function ProductsPage() {
  const api = useAdminApi();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const productsQuery = useQuery({
    queryKey: ['products', api.token],
    queryFn: () => api.products()
  });

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProductInput }) =>
      id ? api.updateProduct(id, input) : api.createProduct(input),
    onSuccess: async (product, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['products', api.token] });
      setDialogState(null);
      setToast(
        variables.id
          ? `«${product.name}» se actualizó correctamente.`
          : `«${product.name}» se agregó al catálogo.`
      );
    }
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const stats = useMemo<ProductMetrics>(() => {
    const active = products.filter((product) => product.active).length;
    const lowStock = products.filter((product) => product.stock <= 10).length;
    const inventoryValue = products.reduce(
      (total, product) => total + product.price * product.stock,
      0
    );
    return { total: products.length, active, lowStock, inventoryValue };
  }, [products]);

  const filtered = useMemo(() => {
    const term = normalizeText(search);
    return products.filter((product) => {
      const matchesCategory = category === 'ALL' || product.category === category;
      const matchesTerm =
        !term || normalizeText(`${product.name} ${product.slug} ${product.tagline}`).includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [products, search, category]);

  function openCreate() {
    mutation.reset();
    setDialogState({ mode: 'create' });
  }

  function openEdit(product: Product) {
    mutation.reset();
    setDialogState({ mode: 'edit', product });
  }

  function closeDialog() {
    if (mutation.isPending) return;
    setDialogState(null);
    mutation.reset();
  }

  const activeProduct = dialogState?.mode === 'edit' ? dialogState.product : null;
  const hasProducts = !productsQuery.isPending && !productsQuery.isError;

  return (
    <div className="animate-fade-up space-y-6">
      <ProductsHeader onCreate={openCreate} />

      <ProductsStats {...stats} />

      <section className="panel overflow-hidden">
        <ProductsToolbar
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        {productsQuery.isPending ? <ProductsSkeleton /> : null}

        {productsQuery.isError ? (
          <PanelMessage
            icon={AlertTriangle}
            tone="danger"
            title="No pudimos cargar el catálogo"
            description={
              productsQuery.error instanceof Error
                ? productsQuery.error.message
                : 'Revisa la conexión con la API e inténtalo de nuevo.'
            }
            action={
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="btn-secondary"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
            }
          />
        ) : null}

        {hasProducts && filtered.length === 0 ? (
          <PanelMessage
            icon={Search}
            title="Sin resultados"
            description="No encontramos productos con esos filtros. Prueba con otro término o limpia la búsqueda."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('ALL');
                }}
                className="btn-secondary"
              >
                Limpiar filtros
              </button>
            }
          />
        ) : null}

        {hasProducts && filtered.length > 0 ? (
          <>
            <p
              role="status"
              className="border-b border-white/5 px-4 py-3 text-xs text-sand-100/45 sm:px-5"
            >
              Mostrando {filtered.length} de {products.length} productos
            </p>
            <ProductsTable products={filtered} onEdit={openEdit} />
            <ProductsCards products={filtered} onEdit={openEdit} />
          </>
        ) : null}
      </section>

      <Toast message={toast} onDismiss={dismissToast} />

      <ProductFormDialog
        open={dialogState !== null}
        product={activeProduct}
        pending={mutation.isPending}
        serverError={mutation.error instanceof Error ? mutation.error.message : null}
        onClose={closeDialog}
        onSubmit={(input) => {
          if (dialogState?.mode === 'edit') {
            mutation.mutate({ id: dialogState.product.id, input });
          } else {
            mutation.mutate({ input });
          }
        }}
      />
    </div>
  );
}
