import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiChatApi } from '../api/ai-chat.api';
import type { SendMessageRequest } from '../types';

export const useStartConversation = () => {
  return useMutation({
    mutationFn: () => aiChatApi.startConversation(),
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['ai-chat', conversationId],
    queryFn: () => aiChatApi.getConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['ai-chat-conversations'],
    queryFn: () => aiChatApi.getConversations(),
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageRequest) => aiChatApi.sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat', conversationId] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => aiChatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-conversations'] });
    },
  });
};

export const useClearHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiChatApi.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-conversations'] });
    },
  });
};
