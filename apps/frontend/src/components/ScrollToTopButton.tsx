'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useChat } from './ChatContext';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const { isChatOpen } = useChat();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible || isChatOpen) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-[84px] right-6 z-50 p-4 rounded-full bg-[var(--color-gold)] text-[var(--color-bg)] shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      role="button"
    >
      <FaArrowUp className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}
