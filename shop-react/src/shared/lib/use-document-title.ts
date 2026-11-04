import { useEffect } from 'react';

const BASE_TITLE = 'Órbita — Objetos para tu día a día';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · Órbita` : BASE_TITLE;

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
