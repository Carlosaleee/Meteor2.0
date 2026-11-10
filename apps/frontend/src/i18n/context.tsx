'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Lang = 'pt' | 'es';
export type Dict = Record<Lang, Record<string, string>>;

type I18nValue = { lang: Lang; setLang: (l: Lang) => void };
const I18nContext = createContext<I18nValue>({ lang: 'pt', setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');
  const [hydrated, setHydrated] = useState(false);

  // Le a preferencia salva uma unica vez, apos a hidratacao.
  useEffect(() => {
    const stored = window.localStorage.getItem('meteor-lang');
    if (stored === 'pt' || stored === 'es') setLangState(stored);
    setHydrated(true);
  }, []);

  // Reflete o idioma no <html lang>. Nao grava no localStorage aqui: esse
  // efeito roda na montagem e sobrescreveria a preferencia salva antes mesmo
  // de o usuario trocar o idioma.
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'es';
  }, [lang, hydrated]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem('meteor-lang', l);
  }, []);

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useDict(dict: Dict): Record<string, string> {
  const { lang } = useI18n();
  return dict[lang];
}
