"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Loader2, Maximize2 } from 'lucide-react';
import { aiChatApi } from '@/features/ai-chat/api/ai-chat.api';
import Link from 'next/link';
import { AiMarkdown } from '@/components/shared/AiMarkdown';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hola, soy tu asistente GymPal. ¿En qué te ayudo?' },
  ]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiChatApi.chatWithAgent(userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat widget error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, ha ocurrido un error al conectar con el agente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="w-80 h-96 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden mb-3">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-medium flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>AI Assistant</span>
              <Link href="/ai-chat">
                <button className="text-slate-400 hover:text-emerald-500 transition-colors p-1">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </span>
          </div>
          <div ref={scrollContainerRef} className="flex-1 p-3 overflow-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg ${
                  m.role === 'assistant'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 mr-8'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 ml-8 text-right'
                }`}
              >
                {m.role === 'assistant' ? (
                  <AiMarkdown content={m.content} />
                ) : (
                  <span className="whitespace-pre-wrap break-words">{m.content}</span>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && send()}
              className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white" 
              placeholder="Escribe..." 
              disabled={isLoading}
            />
            <button onClick={send} disabled={!input.trim() || isLoading} className="text-emerald-600 disabled:opacity-50">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="rounded-full h-12 w-12 bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
