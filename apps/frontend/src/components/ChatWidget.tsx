'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaWater } from 'react-icons/fa';
import { useChat } from './ChatContext';

type Message = { role: 'user' | 'bot'; text: string };

const STORAGE_KEY = 'irons-chat-messages';
const MAX_MESSAGES = 50;

const WELCOME: Message = {
  role: 'bot',
  text: 'Olá! Sou o **Irons**, seu assistente tático de surf e clima. Pergunte sobre previsão do tempo, ondas, vento, trânsito ou comércio na região de Ilha Comprida e Vale do Ribeira.',
};

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [WELCOME];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [WELCOME];
}

function saveMessages(msgs: Message[]) {
  try {
    const toSave = msgs.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

function getReply(userMsg: string): string {
  const q = userMsg.toLowerCase();

  if (q.includes('vento') || q.includes('kite') || q.includes('windsurf')) {
    return '💨 **Vento em tempo real:** Acesse a aba "Previsão de Ventos" na tela de Swell para dados atualizados de velocidade, rajada e direção. Condições ideais para kite: 15-25 km/h. Para windsurf: 12-30 km/h.';
  }
  if (q.includes('chuva') || q.includes('sol') || q.includes('tempo') || q.includes('clima')) {
    return '🌤️ **Previsão meteorológica:** Acesse a tela de Meteorologia para dados em tempo real das 4 cidades (Ilha Comprida, Iguape, Cananéia, Registro). Dados via Open-Meteo com atualização a cada 24h.';
  }
  if (q.includes('onda') || q.includes('swell') || q.includes('surf') || q.includes('mar')) {
    return '🏄 **Condições do mar:** Acesse a tela de Swell para gráficos de ondas, spots de surf e resumo IA com briefing tático. Dados via Open-Meteo Marine com qualidade分类ada por altura e período.';
  }
  if (q.includes('mare') || q.includes('maré') || q.includes('coeficiente')) {
    return '🌙 **Marés:** Próximas marés altas e baixas estão disponíveis na aba "Marés" da tela de Swell. Coeficiente e horários são atualizados diariamente.';
  }
  if (q.includes('balsa') || q.includes('transito') || q.includes('trânsito') || q.includes('rodovia')) {
    return '🚗 **Trânsito:** Status das rodovias SP-222, BR-116 e Balsa Cananeia disponível na tela de Notícias. Dados de fluxo e tempo de espera atualizados.';
  }
  if (q.includes('comercio') || q.includes('comércio') || q.includes('restaurante') || q.includes('hotel') || q.includes('pousada')) {
    return '🏪 **Comércio local:** Diretório com 50 estabelecimentos em Ilha Comprida — alimentação, hospedagem, comércio, serviços e lazer. Acesse a tela de Comércio com mapa interativo.';
  }
  if (q.includes('noticia') || q.includes('notícia') || q.includes('regional')) {
    return '📰 **Notícias regionais:** 12 notícias do Vale do Ribeira com status de trânsito e rotas. Acesse a tela de Notícias para mais detalhes.';
  }
  if (q.includes('picos') || q.includes('spot') || q.includes('prancha')) {
    return '📍 **Spots de surf:** 6 points mapeados — Juréia, Ponta da Praia Norte, Boqueirão Norte/Sul, Costão do Sul e Parada do Surf. Filtre por nível (iniciante/intermediário/avançado) na aba "Points".';
  }
  if (q.includes('oi') || q.includes('olá') || q.includes('ola') || q.includes('hello')) {
    return 'Olá! Sou o Irons. Como posso ajudar? Pergunte sobre o tempo, ondas, vento, trânsito ou comércio.';
  }
  if (q.includes('quem') || q.includes('sobre') || q.includes('faz')) {
    return 'Sou o Irons, assistente tático do Meteor 2.0. Fui criado em homenagem ao surfista Andy Irons. Meu objetivo é te ajudar com informações sobre clima, surf, trânsito e comércio de Ilha Comprida e Vale do Ribeira.';
  }

  return '📊 **Consulte os dados em tempo real:** Use as telas do Meteor 2.0 para previsões precisas de Previsão do Tempo, ondas, vento, trânsito e comércio. Para dúvidas específicas, pergunte sobre um desses tópicos!';
}

export function ChatWidget() {
  const { isChatOpen, toggleChat, setChatOpen } = useChat();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    saveMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getReply(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        title="Irons — Assistente Tático"
        aria-label={isChatOpen ? 'Fechar chat Irons' : 'Abrir chat Irons'}
        aria-expanded={isChatOpen}
      >
        <FaWater className="w-6 h-6" />
      </button>

      {/* Janela de Chat */}
      {isChatOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 fade-in duration-200"
          role="dialog"
          aria-label="Chat com Irons"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-900/40 via-slate-800 to-slate-800 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <FaWater className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">IRONS</h3>
                <p className="text-[10px] text-amber-400/80 font-mono">ASSISTENTE TÁTICO</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Fechar chat"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-150`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-600/90 text-white rounded-br-md'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-md'
                  }`}
                >
                  {m.text.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in duration-150">
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
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
          <form onSubmit={handleSend} className="p-3 bg-slate-800/80 border-t border-slate-700/50 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte sobre tempo, ondas, vento..."
              className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
              aria-label="Digite sua mensagem"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Enviar mensagem"
            >
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
