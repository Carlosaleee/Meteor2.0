'use client';

import { useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

/** Observes the data-theme attribute of <html> set by Header. */
export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>('dark'); // SSR-safe: dark is default
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setMode(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return mode;
}
