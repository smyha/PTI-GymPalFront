import { http } from '@/lib/http';
import type { Message, Conversation, SendMessageRequest, AIChatResponse } from '../types';

const baseUrl = '/api/v1/ai-chat';

export const aiChatApi = {
  // Start new conversation
  startConversation: () =>
    http.post<{ data: Conversation }>(`${baseUrl}/conversations`, {}),

  // Get conversation history
  getConversation: (conversationId: string) =>
    http.get<{ data: Conversation }>(`${baseUrl}/conversations/${conversationId}`),

  // Get all conversations
  getConversations: () =>
    http.get<{ data: Conversation[] }>(`${baseUrl}/conversations`),

  // Send message
  sendMessage: (conversationId: string, body: SendMessageRequest) =>
    http.post<AIChatResponse>(`${baseUrl}/conversations/${conversationId}/messages`, body),

  // Delete conversation
  deleteConversation: (conversationId: string) =>
    http.delete<{ success: boolean }>(`${baseUrl}/conversations/${conversationId}`),

  // Clear conversation history
  clearHistory: () =>
    http.delete<{ success: boolean }>(`${baseUrl}/conversations`),
};
