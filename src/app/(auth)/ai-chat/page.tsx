'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Dumbbell, Utensils, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function AIChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiChat.greeting'),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Backend AI endpoint no disponible aún en openapi; mantenemos respuesta simulada
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('aiChat.greeting'),
        },
      ]);
    }, 1000);
  };

  const suggestedPrompts = [
    { icon: Dumbbell, text: t('aiChat.suggestedPrompts.routine'), color: 'orange' },
    { icon: Utensils, text: t('aiChat.suggestedPrompts.diet'), color: 'green' },
    { icon: Calendar, text: t('aiChat.suggestedPrompts.calendar'), color: 'blue' },
    { icon: Sparkles, text: t('common.comingSoon'), color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            {t('aiChat.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('aiChat.subtitle')}</p>
        </div>
        <Badge variant="outline" className="border-purple-500 text-purple-400">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          {t('common.success')}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/workouts/new">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Dumbbell className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1">AI: {t('workouts.createNew')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('common.comingSoon')}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nutrition/create">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Utensils className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1">AI: {t('diet.createPlan')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('common.comingSoon')}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1">AI: {t('calendar.title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('common.comingSoon')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Chat Interface */}
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-[calc(100vh-280px)] flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className={message.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}>
                    <AvatarFallback className="text-white bg-transparent">
                      {message.role === 'assistant' ? <Sparkles className="h-5 w-5" /> : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-4 max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Prompts - shown when no user messages */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Quick suggestions:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInput(prompt.text)}
                      className="flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors group"
                    >
                      <Icon className={`h-4 w-4 text-${prompt.color}-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <Textarea
                placeholder={t('aiChat.placeholder')}
                className="min-h-[60px] max-h-[150px] bg-background border-border text-foreground resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              {t('aiChat.subtitle')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
