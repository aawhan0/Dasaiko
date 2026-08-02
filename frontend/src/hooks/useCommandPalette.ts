import { useEffect, useCallback } from 'react';

/** Opens / closes the command palette on Ctrl+K or Cmd+K */
export function useCommandPalette(onToggle: () => void) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
