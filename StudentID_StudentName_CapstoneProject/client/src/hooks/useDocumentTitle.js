import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const base = 'Alex Chen — Product designer & developer';
    document.title = title ? `${title} · Alex Chen` : base;
    return () => {
      document.title = base;
    };
  }, [title]);
}
