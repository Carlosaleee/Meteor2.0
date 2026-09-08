import { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([
    { role: 'bot', text: '🏄 Olá! Sou o **MeteorBot**, seu assistente de telemetria. Como posso ajudar com a previsão do tempo, maré ou trânsito hoje?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let reply = 'Análise tática simulada: Condições estáveis em Ilha Comprida e Vale do Ribeira. Ventos moderados e mar com ondas de 1.2m.';
      if (userMsg.toLowerCase().includes('vento')) {
        printWindReply();
        reply = 'Ventos soprando de Sudeste a 15 km/h com rajadas leves. Boa visibilidade na região costeira.';
      } else if (userMsg.toLowerCase().includes('chuva') || userMsg.toLowerCase().includes('sol')) {
        reply = 'Previsão indica sol entre nuvens para hoje, sem probabilidade significativa de temporais na região.';
      } else if (userMsg.toLowerCase().includes('balsa') || userMsg.toLowerCase().includes('transito')) {
        reply = 'Trânsito fluindo normalmente na SP-222 e BR-116. Travessia de balsa operando com tempo de espera estimado em 15 minutos.';
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 800);
  };

  const printWindReply = () => {};

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105"
        title="MeteorBot IA"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Janela de Chat Flutuante */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[450px]">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">MeteorBot IA</h3>
                <p className="text-[10px] text-slate-400">Assistente Tático Regional</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte sobre o tempo, vento..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
