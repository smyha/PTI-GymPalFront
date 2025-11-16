export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type SendMessageRequest = {
  content: string;
  conversationId?: string;
  context?: {
    userFitnessLevel?: string;
    currentGoals?: string[];
    recentWorkouts?: any[];
  };
};

export type AIChatResponse = {
  message: Message;
  conversationId: string;
  suggestions?: string[];
};
