import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const DEV_TOKEN = 'orbita-admin-dev';
const isDev = import.meta.env.DEV;

interface TokenFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (token: string) => void;
  onClearError: () => void;
}

export function TokenForm({ pending, error, onSubmit, onClearError }: TokenFormProps) {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(token.trim());
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="admin-token" className="field-label">
            Token de administrador
          </label>
          <div className="relative mt-2">
            <input
              id="admin-token"
              name="token"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                if (error) onClearError();
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder="••••••••••••"
              aria-describedby={error ? 'token-error' : undefined}
              aria-invalid={Boolean(error)}
              className="field pr-12 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken((current) => !current)}
              aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
              className="absolute top-1/2 right-2.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-sand-100/50 transition hover:bg-white/10 hover:text-sand-50"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p
            id="token-error"
            role="alert"
            className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? 'Validando…' : 'Entrar al panel'}
        </button>
      </form>

      {isDev ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold tracking-wide text-sand-50">Entorno local</p>
          <p className="mt-1 text-xs leading-relaxed text-sand-100/55">
            Token de desarrollo:{' '}
            <code className="rounded bg-ink-950/80 px-1.5 py-0.5 font-mono text-signal-300">
              {DEV_TOKEN}
            </code>
          </p>
          <button
            type="button"
            onClick={() => {
              setToken(DEV_TOKEN);
              onClearError();
            }}
            className="mt-2 text-xs font-semibold text-signal-300 underline-offset-4 transition hover:text-signal-200 hover:underline"
          >
            Usar token de desarrollo
          </button>
        </div>
      ) : null}
    </>
  );
}
