import { Link } from 'react-router-dom';

const shopLinks = [
  { to: '/?categoria=audio#catalogo', label: 'Audio' },
  { to: '/?categoria=calzado#catalogo', label: 'Calzado' },
  { to: '/?categoria=accesorios#catalogo', label: 'Accesorios' },
  { to: '/?categoria=hogar#catalogo', label: 'Hogar' }
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
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
            <span className="text-sm font-semibold tracking-[0.28em]">ÓRBITA</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-100/60">
            Objetos de diseño para el día a día. Seleccionamos piezas duraderas, funcionales y
            honestas con los materiales.
          </p>
          <p className="mt-4 text-xs text-sand-100/40">Ciudad de México · Envíos a todo el país</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-sand-100/50 uppercase">
            Tienda
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/70">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-sand-50">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-sand-100/50 uppercase">
            Ayuda
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-sand-100/70">
            <li>Envíos en 2 a 4 días hábiles</li>
            <li>Devoluciones por 30 días</li>
            <li>Pagos simulados en esta demo</li>
            <li>hola@orbita.demo</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-2 py-6 text-xs text-sand-100/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Órbita. Proyecto de portafolio.</p>
          <p>Tienda demo: ningún cobro ni envío es real.</p>
        </div>
      </div>
    </footer>
  );
}
