import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/shared/components/EmptyState';
import { useDocumentTitle } from '@/shared/lib/use-document-title';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');

  return (
    <div className="container-shell py-16">
      <EmptyState
        icon={<Compass className="h-7 w-7" aria-hidden="true" />}
        title="Esta página no existe"
        description="Quizá el enlace cambió o la pieza ya no está disponible. Vuelve al catálogo para seguir explorando."
        action={
          <Link to="/#catalogo" className="btn-primary">
            Ir al catálogo
          </Link>
        }
      />
    </div>
  );
}
