import { Database, Package, ReceiptText, ShieldCheck } from 'lucide-react';

import { Brand } from '@/components/Brand';

const highlights = [
  {
    icon: Package,
    label: 'Catálogo e inventario',
    detail: 'Altas, ediciones y stock en un solo lugar.'
  },
  {
    icon: ReceiptText,
    label: 'Pedidos de la tienda',
    detail: 'Cliente, pago, entrega y partidas.'
  },
  {
    icon: Database,
    label: 'Datos persistentes',
    detail: 'SQLite local con seed reproducible.'
  }
];

export function AuthShowcase() {
  return (
    <section className="hidden flex-col justify-between gap-10 border-r border-white/10 bg-ink-800/40 p-10 lg:flex">
      <Brand />

      <div>
        <p className="eyebrow">Panel de administración</p>
        <h1 className="mt-3 max-w-sm font-display text-4xl leading-tight text-sand-50">
          El control de tu tienda, sin ruido.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-100/65">
          Administra los productos que ve el catálogo y revisa los pedidos generados en Órbita. Todo
          sobre una API GraphQL con persistencia real.
        </p>
      </div>

      <ul className="space-y-4">
        {highlights.map(({ icon: Icon, label, detail }) => (
          <li key={label} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-signal-300">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-sand-50">{label}</span>
              <span className="block text-xs text-sand-100/55">{detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-2 text-xs text-sand-100/45">
        <ShieldCheck className="h-4 w-4 text-signal-300/80" aria-hidden="true" />
        GraphQL Yoga · Express · SQLite · React
      </p>
    </section>
  );
}
