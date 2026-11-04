import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

import { Brand } from '@/components/Brand';
import { GraphQLRequestError, verifyAdminToken } from '@/services/graphql-client';
import { useSession } from '@/session/session-context';

import { AuthShowcase } from './components/AuthShowcase';
import { TokenForm } from './components/TokenForm';

export function TokenGate() {
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(candidate: string) {
    if (!candidate) {
      setError('Escribe el token de administrador para continuar.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      await verifyAdminToken(candidate);
      signIn(candidate);
    } catch (caught) {
      if (caught instanceof GraphQLRequestError && caught.code === 'UNAUTHENTICATED') {
        setError('El token no es válido. Revisa el valor de ADMIN_TOKEN en el servidor.');
      } else if (caught instanceof GraphQLRequestError) {
        setError(caught.message);
      } else {
        setError('Ocurrió un error inesperado al validar el token.');
      }
      setPending(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_40rem_at_20%_10%,rgb(14_165_233/0.16),transparent_65%)]"
      />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-ink-900/75 shadow-2xl backdrop-blur-xl lg:grid lg:grid-cols-[1.02fr_0.98fr]">
        <AuthShowcase />

        <section className="p-6 sm:p-10">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="mt-10 lg:mt-0">
            <p className="eyebrow">Acceso restringido</p>
            <h2 className="mt-2 font-display text-3xl text-sand-50 sm:text-4xl">Entra al panel</h2>
            <p className="mt-3 text-sm leading-relaxed text-sand-100/60">
              Usa el token de administrador configurado en el servidor. La sesión se guarda solo
              durante esta pestaña.
            </p>
          </div>

          <TokenForm
            pending={pending}
            error={error}
            onSubmit={handleSubmit}
            onClearError={() => setError(null)}
          />

          <p className="mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-sand-100/40">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            El token solo se envía a la API GraphQL configurada y nunca se comparte con servicios
            externos.
          </p>
        </section>
      </div>
    </main>
  );
}
