import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2, Lock } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { calculateTotals, priceLines } from '@/domain/cart';
import { CartSummary } from '@/features/cart/CartSummary';
import type { CheckoutValues } from '@/models/checkout';
import { products } from '@/services/catalog-service';
import { createOrder, saveOrder } from '@/services/order-service';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

import { checkoutDefaults, checkoutSchema } from './checkout-schema';
import { CheckoutContactSection } from './components/CheckoutContactSection';
import { CheckoutEmptyState } from './components/CheckoutEmptyState';
import { CheckoutPaymentSection } from './components/CheckoutPaymentSection';
import { CheckoutShippingSection } from './components/CheckoutShippingSection';

export function CheckoutPage() {
  useDocumentTitle('Finalizar compra');
  const navigate = useNavigate();
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);
  const pushToast = useToastStore((state) => state.push);

  const pricedLines = priceLines(lines, products);
  const totals = calculateTotals(pricedLines);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaults
  });

  const paymentMethod = useWatch({ control, name: 'paymentMethod' });

  if (pricedLines.length === 0) {
    return <CheckoutEmptyState />;
  }

  async function onSubmit(values: CheckoutValues) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const order = createOrder(values, pricedLines, totals);
    saveOrder(order);
    navigate(`/pedido/${order.id}`, { replace: true });
    clear();
    pushToast('Pedido confirmado. ¡Gracias por tu compra!');
  }

  return (
    <div className="container-shell py-12">
      <Link
        to="/carrito"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-sand-100/50 transition hover:text-sand-50"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Volver al carrito
      </Link>

      <div className="mt-4">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Finalizar compra</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sand-100/55">
          Este es un flujo de demostración: valida tus datos y simula el pedido, pero no se realiza
          ningún cargo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-10 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="space-y-6">
          <CheckoutContactSection register={register} errors={errors} />
          <CheckoutShippingSection register={register} errors={errors} />
          <CheckoutPaymentSection
            register={register}
            errors={errors}
            paymentMethod={paymentMethod}
          />
        </div>

        <aside className="lg:sticky lg:top-28">
          <CartSummary totals={totals} items={pricedLines} title="Tu pedido">
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Procesando…
                </>
              ) : (
                <Lock className="h-4 w-4" aria-hidden="true" />
              )}
              {isSubmitting ? 'Procesando' : 'Confirmar pedido'}
            </button>
            <p className="mt-3 text-center text-[11px] text-sand-100/35">
              Pago simulado. No se solicita información bancaria real.
            </p>
          </CartSummary>
        </aside>
      </form>
    </div>
  );
}
