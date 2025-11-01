"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hola, soy tu asistente GymPal. ¿En qué te ayudo?' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    // Endpoint de chat no disponible en openapi; mantenemos respuesta simulada
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: '¡Recibido! Pronto tendré respuestas inteligentes aquí.' }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="w-80 h-96 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden mb-3">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-medium">AI Assistant</div>
          <div className="flex-1 p-3 overflow-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'assistant' ? 'text-slate-700 dark:text-slate-200' : 'text-emerald-600 dark:text-emerald-400 text-right'}`}>{m.content}</div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 text-sm bg-transparent outline-none" placeholder="Escribe..." />
            <button onClick={send} className="text-emerald-600"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="rounded-full h-12 w-12 bg-emerald-500 text-white shadow-lg flex items-center justify-center">
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
