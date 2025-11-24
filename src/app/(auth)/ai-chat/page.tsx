'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Dumbbell, Utensils, Calendar, Sparkles, Loader2, User, Plus, MessageSquare, Trash2, Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { aiChatApi } from '@/features/ai-chat/api/ai-chat.api';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api';
import { format } from 'date-fns';
import { AiMarkdown } from '@/components/shared/AiMarkdown';

/**
 * AIChatPage Component
 * 
 * Provides an interface for interacting with AI agents.
 * Features:
 * - Real-time chat interface
 * - Conversation management (create, delete, switch)
 * - Voice input (speech-to-text)
 * - Integration with specialized agents (Reception, Data, Routine)
 * - Quick action suggestions
 */
export default function AIChatPage() {
  const { t } = useTranslation();
  // State for chat messages
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  // State for list of conversations
  const [conversations, setConversations] = useState<any[]>([]);
  // Currently active conversation ID
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  // Current input text
  const [input, setInput] = useState('');
  // Loading state for sending messages
  const [isLoading, setIsLoading] = useState(false);
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // User's avatar URL
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs for speech recognition and auto-scrolling
  const recognitionRef = useRef<any>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Initialize Speech Recognition on component mount
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES'; // Default to Spanish as per context

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append final transcript to input
        if (finalTranscript) {
            setInput(prev => {
                const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                return prev + space + finalTranscript;
            });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please check your permissions.');
        } else if (event.error === 'no-speech') {
            // Ignore no-speech errors, often just means silence
        } else if (event.error === 'audio-capture') {
            toast.error('No microphone found or audio capture failed.');
        } else {
            toast.error(`Voice recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  /**
   * Toggle voice recording state
   * Handles permission requests and start/stop logic
   */
  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        // Explicitly request microphone access first to handle permissions/errors better
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we just wanted to check permission/existence
        stream.getTracks().forEach(track => track.stop());

        recognitionRef.current.start();
        setIsRecording(true);
        toast.success('Listening...');
      } catch (error: any) {
        console.error('Failed to start recording:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            toast.error('Microphone permission denied. Please allow access.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            toast.error('No microphone found on this device.');
        } else {
            toast.error('Could not access microphone.');
        }
      }
    }
  };

  /**
   * Load initial data (profile, conversations) on mount
   */
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // Resolve promises independently to handle errors gracefully and better typing
        const profileResponse = await profileApi.getProfile();
        const conversationsResponse = await aiChatApi.getConversations().catch(() => ({ data: { conversations: [] } } as any));

        const profile = profileResponse.data;
        // Handle potential data wrapper inconsistencies safely
        const conversationsData = (conversationsResponse as any).data || conversationsResponse;

        if (profile?.avatarUrl) {
          setUserAvatar(profile.avatarUrl);
        }

        const fetchedConversations = conversationsData?.conversations || [];
        setConversations(fetchedConversations);

        if (fetchedConversations.length > 0) {
          // Load the latest conversation by default
          const latestConversation = fetchedConversations[0];
          setCurrentConversationId(latestConversation.id);
          loadMessages(latestConversation.id);
        } else {
           setMessages([
            {
              role: 'assistant',
              content: t('aiChat.greeting'),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setMessages([
          {
            role: 'assistant',
            content: t('aiChat.greeting'),
          },
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [t]);

  /**
   * Load messages for a specific conversation
   * @param conversationId - The ID of the conversation to load
   */
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await aiChatApi.getConversationMessages(conversationId);
      const history = response.data.messages || [];
      
      if (history.length > 0) {
        setMessages(history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })));
      } else {
        setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Scroll chat view to bottom when receiving messages
   */
  useEffect(() => {
    if (isInitialLoading) return;

    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const behavior: ScrollBehavior = distanceFromBottom < 150 ? 'smooth' : 'auto';

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });
  }, [messages, isInitialLoading]);

  /**
   * Create a new empty conversation
   */
  const handleCreateNewChat = async () => {
    try {
      const { data: newConversation } = await aiChatApi.startConversation('New Chat');
      setConversations([newConversation, ...conversations]);
      setCurrentConversationId(newConversation.id);
      setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error('Failed to start new conversation');
    }
  };

  /**
   * Delete a conversation
   * @param e - Click event
   * @param conversationId - ID of conversation to delete
   */
  const handleDeleteChat = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await aiChatApi.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConversations);
      
      if (currentConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          setCurrentConversationId(updatedConversations[0].id);
          loadMessages(updatedConversations[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
        }
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete conversation');
    }
  };

  /**
   * Select a conversation from the sidebar
   * @param conversationId - ID of conversation to select
   */
  const handleSelectConversation = (conversationId: string) => {
    if (conversationId === currentConversationId) return;
    setCurrentConversationId(conversationId);
    loadMessages(conversationId);
  };

  /**
   * Stop the current generation
   */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info('Generation stopped');
    }
  };

  /**
   * Send a message to the AI agent
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // If no current conversation, create one first
      let targetConversationId = currentConversationId;
      if (!targetConversationId) {
         const { data: newConversation } = await aiChatApi.startConversation(userMessage.substring(0, 30) + '...');
         setConversations([newConversation, ...conversations]);
         setCurrentConversationId(newConversation.id);
         targetConversationId = newConversation.id;
      }

      const response = await aiChatApi.chatWithAgent(userMessage, targetConversationId!, controller.signal);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
        },
      ]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled by user
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '[Generation stopped by user]',
          },
        ]);
      } else {
        console.error('Chat error:', error);
        toast.error('Failed to communicate with AI Agent');
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "Sorry, I'm having trouble connecting to the agent right now. Please try again later.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
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

      {/* Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-[calc(100vh-260px)] lg:min-h-[520px]">
        
        {/* Sidebar - Conversations List */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 lg:col-span-1 flex flex-col overflow-hidden lg:h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <Button 
              onClick={handleCreateNewChat}
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                      currentConversationId === conv.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">{conv.title || 'New Chat'}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {format(new Date(conv.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                      onClick={(e) => handleDeleteChat(e, conv.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="text-center p-4 text-slate-500 text-sm">
                    No conversations yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Main Chat Area */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 lg:col-span-3 flex flex-col overflow-hidden min-h-[550px] lg:h-full">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 min-h-0">
              <ScrollArea ref={messagesViewportRef} className="h-full p-6">
              {isInitialLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                     <div className="relative flex h-16 w-16">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-20"></span>
                       <span className="relative inline-flex rounded-full h-16 w-16 bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                         <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                       </span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading conversation...</p>
                  </div>
                </div>
              ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={message.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}>
                      {message.role === 'user' && userAvatar ? (
                        <AvatarImage src={userAvatar} alt="User" />
                      ) : null}
                      <AvatarFallback className="text-white bg-transparent">
                        {message.role === 'assistant' ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 max-w-[85%] md:max-w-[70%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <AiMarkdown content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                )}
              </ScrollArea>
            </div>

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
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <div className="flex gap-2 items-end">
                <Button
                  onClick={toggleRecording}
                  variant="outline"
                  className={`flex-shrink-0 h-10 w-10 p-0 rounded-full border-slate-300 dark:border-slate-600 ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 border-red-500 animate-pulse dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-background hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  placeholder={isRecording ? "Listening..." : t('aiChat.placeholder')}
                  className="min-h-[40px] max-h-[150px] bg-background border-border text-foreground resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                {isLoading ? (
                  <Button
                    onClick={handleStop}
                    className="bg-red-500 hover:bg-red-600 text-white h-10 px-4"
                    title="Stop generating"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-10 px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                {t('aiChat.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
