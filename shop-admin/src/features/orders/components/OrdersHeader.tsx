export function OrdersHeader() {
  return (
    <header>
      <p className="eyebrow">Operación</p>
      <h1 className="mt-2 font-display text-3xl text-sand-50 sm:text-4xl">Pedidos</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand-100/60">
        Revisa los pedidos generados en la tienda: cliente, método de pago, estado de entrega y
        desglose de artículos.
      </p>
    </header>
  );
}
