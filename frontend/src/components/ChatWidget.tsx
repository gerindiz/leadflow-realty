'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy Sofía, tu asistente inmobiliaria 🏠 ¿Estás buscando comprar, alquilar o invertir?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [leadCapturado, setLeadCapturado] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 280);
  }, [open, minimized]);

  const formatTime = (d: Date) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const send = async () => {
    const text = input.trim();
    if (!text || loading || leadCapturado) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setLoading(true);
    try {
      const res = await sendChatMessage(sessionId, text);
      setSessionId(res.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.respuesta, timestamp: new Date() }]);
      if (res.leadCapturado) setLeadCapturado(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Disculpá, tuve un problema de conexión. ¿Podés intentarlo?', timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: '¡Hola! Soy Sofía, tu asistente inmobiliaria 🏠 ¿Estás buscando comprar, alquilar o invertir?', timestamp: new Date() }]);
    setSessionId(null);
    setLeadCapturado(false);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="chat-open w-[360px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white">S</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 border-2 border-emerald-600 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-none">Sofía</p>
              <p className="text-emerald-100 text-xs mt-0.5">Asistente inmobiliaria · En línea</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors" title="Nueva conversación">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button onClick={() => setMinimized(m => !m)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {minimized
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />}
                </svg>
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: minimized ? 0 : '460px' }}>
            {/* Messages */}
            <div className="overflow-y-auto chat-scroll px-4 py-4 space-y-3 bg-slate-50" style={{ maxHeight: '320px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.timestamp)}</span>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start gap-0.5">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full dot-1" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full dot-2" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full dot-3" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">Sofía está escribiendo...</span>
                </div>
              )}

              {leadCapturado && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-emerald-700 text-xs font-medium">✓ ¡Datos registrados! Un asesor te contactará pronto.</p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-100 bg-white">
              {leadCapturado ? (
                <button
                  onClick={reset}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors border border-emerald-200"
                >
                  Nueva consulta
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Escribí tu mensaje..."
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:opacity-50 transition-all"
                  />
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-center text-[10px] text-slate-400 mt-2">Powered by LeadFlow Realty IA</p>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(o => !o); setMinimized(false); }}
        className="relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all active:scale-95 flex items-center justify-center"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping" />}
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">1</span>
        )}
      </button>
    </div>
  );
}
