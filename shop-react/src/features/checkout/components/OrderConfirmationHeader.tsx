import { CheckCircle2, PackageCheck } from 'lucide-react';

import type { Order } from '@/models/order';

export function OrderConfirmationHeader({ order }: { order: Order }) {
  const firstName = order.customer.fullName.split(' ')[0];

  return (
    <div className="text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-6">Pedido confirmado</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Gracias, {firstName}.
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-sand-100/60">
        Recibimos tu pedido y enviamos la confirmación a{' '}
        <span className="font-medium text-sand-100/85">{order.customer.email}</span>. Esto es una
        demo: no se realizará ningún cargo ni envío real.
      </p>
      <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-sand-100/60">
        <PackageCheck className="h-4 w-4 text-signal-300" aria-hidden="true" />
        Pedido <span className="font-mono font-semibold text-sand-50">{order.id}</span>
      </p>
    </div>
  );
}
