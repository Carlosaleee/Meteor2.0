'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaWater, FaRedo, FaTrashAlt } from 'react-icons/fa';
import { useChat } from './ChatContext';
import { API_BASE } from '../lib/api';
import { useDict } from '@/i18n/context';
import { common } from '@/i18n/dictionaries/common';

type Message = { role: 'user' | 'bot'; text: string };
type ChatRole = 'user' | 'assistant';
type HistoryEntry = { role: ChatRole; content: string };

const STORAGE_KEY = 'irons-chat-messages';
const MAX_MESSAGES = 50;
const HISTORY_LIMIT = 10;

function newSessionId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function welcomeMessage(t: Record<string, string>): Message {
  return { role: 'bot', text: t['chat.welcome'] };
}

function loadMessages(fallback: Message): Message[] {
  if (typeof window === 'undefined') return [fallback];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((m): m is Message => m && typeof m.text === 'string');
      }
    }
  } catch {}
  return [fallback];
}

function saveMessages(msgs: Message[]) {
  try {
    const toSave = msgs.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

export function ChatWidget() {
  const { isChatOpen, toggleChat, setChatOpen } = useChat();
  const t = useDict(common);
  const welcomeText = t['chat.welcome'];
  const [messages, setMessages] = useState<Message[]>(() => [welcomeMessage(t)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());
  const [status, setStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipSaveRef = useRef(false);

  useEffect(() => {
    setMessages(loadMessages({ role: 'bot', text: welcomeText }));
  }, [welcomeText]);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    saveMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(''), 2000);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    const history: HistoryEntry[] = messages
      .slice(-HISTORY_LIMIT)
      .filter((m): m is Message => Boolean(m && typeof m.text === 'string' && m.text.trim().length > 0))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const apiBase = API_BASE;
      const res = await fetch(`${apiBase}/v1/iron/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId, history }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`API ${res.status}`);
      }

      const json = (await res.json()) as {
        reply?: string;
        data?: { reply?: string };
        success?: boolean;
      };

      const replyText = json.data?.reply ?? json.reply;
      if (!replyText || typeof replyText !== 'string') {
        throw new Error('Formato de resposta inválido');
      }

      setMessages(prev => [...prev, { role: 'bot', text: replyText }]);
    } catch (err: unknown) {
      const isRateLimit = err instanceof Error && err.message === 'RATE_LIMIT';
      setMessages(prev => [...prev, {
        role: 'bot',
        text: isRateLimit ? t['chat.error.rateLimit'] : t['chat.error.generic'],
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRestart = () => {
    skipSaveRef.current = true;
    setMessages([welcomeMessage(t)]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSessionId(newSessionId());
    setStatus(t['chat.status.restarted']);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (!window.confirm(t['chat.confirmClear'])) return;
    skipSaveRef.current = true;
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setStatus(t['chat.status.cleared']);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset)]"
        title={t['chat.fab.title']}
        aria-label={isChatOpen ? t['chat.fab.close'] : t['chat.fab.open']}
        aria-expanded={isChatOpen}
      >
        <FaWater className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Janela de Chat */}
      {isChatOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card border border-card-line/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 fade-in duration-200"
          role="dialog"
          aria-label={t['chat.dialog.aria']}
        >
          <div className="sr-only" role="status" aria-live="polite">{status}</div>

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-900/40 via-card-2 to-card-2 border-b border-card-line/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <FaWater className="w-5 h-5 text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-card-text tracking-wide">IRONS</h3>
                <p className="text-[10px] text-amber-400/80 font-mono">{t['chat.subtitle']}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRestart}
                disabled={isTyping}
                className="text-card-muted hover:text-card-text transition-colors p-1 rounded-lg hover:bg-card-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={t['chat.action.restart']}
                title={t['chat.action.restart']}
              >
                <FaRedo className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={handleClear}
                disabled={isTyping}
                className="text-card-muted hover:text-card-text transition-colors p-1 rounded-lg hover:bg-card-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={t['chat.action.clear']}
                title={t['chat.action.clear']}
              >
                <FaTrashAlt className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setChatOpen(false)}
                className="text-card-muted hover:text-card-text transition-colors p-1 rounded-lg hover:bg-card-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label={t['chat.action.close']}
                title={t['chat.action.close']}
              >
                <FaTimes className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin scrollbar-thumb-card-line scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="h-full min-h-[200px] flex items-center justify-center">
                <p className="text-card-dim text-xs text-center px-4">
                  {t['chat.empty']}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-150`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[var(--color-amber-btn)] text-[var(--color-amber-on)] rounded-br-md'
                      : 'bg-card-2/80 text-card-text border border-card-line/50 rounded-bl-md'
                  }`}
                >
                  {(m.text ?? '').split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in duration-150">
                <div className="bg-card-2/80 border border-card-line/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-card-2/80 border-t border-card-line/50 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t['chat.placeholder']}
              className="flex-1 bg-card/80 border border-card-line/50 rounded-xl px-4 py-2.5 text-xs text-card-text placeholder-card-dim focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              aria-label={t['chat.input.aria']}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-[var(--color-amber-btn)] hover:bg-[var(--color-amber-btn-hover)] text-[var(--color-amber-on)] transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={t['chat.send']}
              title={t['chat.send']}
            >
              <FaPaperPlane className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
