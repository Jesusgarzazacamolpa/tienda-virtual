import { ArrowRight, Sparkles, Truck, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Product } from '@/models/product';
import { formatPrice } from '@/shared/lib/format';

const benefits = [
  { icon: Truck, title: 'Envío gratis', detail: 'Desde $1,500' },
  { icon: Undo2, title: '30 días', detail: 'Devoluciones' },
  { icon: Sparkles, title: 'Curado', detail: 'Pocas piezas' }
];

export function HeroSection({ featured }: { featured: Product }) {
  return (
    <section aria-labelledby="hero-titulo" className="container-shell pt-12 pb-4 lg:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="animate-fade-up">
          <p className="eyebrow">Nueva temporada · 2026</p>
          <h1
            id="hero-titulo"
            className="mt-5 text-5xl leading-[0.98] font-semibold tracking-tight sm:text-6xl xl:text-7xl"
          >
            Objetos que hacen tu día{' '}
            <span className="font-display text-signal-300 italic">más simple.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sand-100/65 sm:text-lg">
            Una selección pequeña y deliberada de piezas que usas todos los días. Buenos materiales,
            diseño honesto y envío a todo México.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#catalogo" className="btn-primary">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link to={`/producto/${featured.slug}`} className="btn-secondary">
              Ver lo más vendido
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {benefits.map(({ icon: Icon, title, detail }) => (
              <div key={title}>
                <dt className="flex items-center gap-2 text-xs font-medium text-sand-100/50">
                  <Icon className="h-4 w-4 text-signal-400" aria-hidden="true" />
                  {title}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-sand-50">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-sand-100">
            <img
              src="/products/hero.webp"
              alt="Composición de audífonos, reloj y tenis sobre pedestales de piedra"
              width={1600}
              height={1067}
              className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/70 to-transparent" />
            <span className="absolute top-5 right-5 rounded-full bg-ink-950/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-50 uppercase backdrop-blur">
              Envío gratis
            </span>
          </div>

          <Link
            to={`/producto/${featured.slug}`}
            className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-ink-950/85 p-3 pr-5 shadow-2xl backdrop-blur transition hover:border-white/30"
          >
            <img
              src={featured.image}
              alt=""
              width={900}
              height={900}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <span>
              <span className="block text-xs text-sand-100/55">Favorito de la casa</span>
              <span className="block text-sm font-semibold text-sand-50">{featured.name}</span>
              <span className="block text-xs font-medium text-signal-300">
                {formatPrice(featured.price)}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
