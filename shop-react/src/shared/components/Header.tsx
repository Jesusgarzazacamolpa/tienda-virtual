import { Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { selectCartCount, useCartStore } from '@/store/cart-store';

const navigation = [
  { to: '/#catalogo', label: 'Tienda' },
  { to: '/?categoria=audio#catalogo', label: 'Audio' },
  { to: '/?categoria=calzado#catalogo', label: 'Calzado' },
  { to: '/?categoria=accesorios#catalogo', label: 'Accesorios' },
  { to: '/?categoria=hogar#catalogo', label: 'Hogar' }
];

export function Header() {
  const cartCount = useCartStore(selectCartCount);

  return (
    <header className="sticky top-0 z-40">
      <p className="border-b border-white/10 bg-ink-950/95 px-4 py-2 text-center text-[11px] font-medium tracking-[0.14em] text-sand-100/60 uppercase backdrop-blur">
        Envío gratis desde $1,500 · Devoluciones sin costo por 30 días
      </p>
      <div className="border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Órbita, ir al inicio">
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-signal-400/50">
              <span
                className="h-4 w-4 rounded-full border-2 border-signal-400"
                aria-hidden="true"
              />
              <span
                className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal-400"
                aria-hidden="true"
              />
            </span>
            <span className="text-sm font-semibold tracking-[0.28em] text-sand-50">ÓRBITA</span>
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link key={item.label} to={item.to} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/#catalogo"
              aria-label="Buscar productos"
              className="grid h-10 w-10 place-items-center rounded-full text-sand-100/70 transition hover:bg-white/5 hover:text-sand-50"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              to="/carrito"
              aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-sand-100/70 transition hover:bg-white/5 hover:text-sand-50"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-signal-400 px-1 text-[10px] font-bold text-ink-950"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      <nav
        aria-label="Categorías"
        className="border-b border-white/10 bg-ink-950/80 backdrop-blur-xl md:hidden"
      >
        <div className="container-shell flex gap-0.5 overflow-x-auto py-2">
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-medium tracking-[0.06em] text-sand-100/70 uppercase transition hover:bg-white/5 hover:text-sand-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
