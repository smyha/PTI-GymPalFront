import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../api/api';

// Get feed of posts
export function usePosts(params?: { page?: number; limit?: number }) {
  return useQuery({ queryKey: ['social','posts', params], queryFn: () => socialApi.posts(params) });
}

// Get single post
export function usePost(id: string) {
  return useQuery({ queryKey: ['social','posts', id], queryFn: () => socialApi.post(id), enabled: !!id });
}

// Create a new post
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => socialApi.createPost(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social','posts'] });
    },
  });
}

// Like a post
export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.like(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['social','posts'] });
      qc.invalidateQueries({ queryKey: ['social','posts', id] });
    },
  });
}

// Unlike a post
export function useUnlikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => socialApi.unlike(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['social','posts'] });
      qc.invalidateQueries({ queryKey: ['social','posts', id] });
    },
  });
}

// Get comments for a post
export function useComments(postId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['social','posts', postId, 'comments', params],
    queryFn: () => socialApi.comments(postId, params),
    enabled: !!postId,
  });
}

// Add comment to a post
export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      socialApi.addComment(postId, { content }),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['social','posts', postId, 'comments'] });
      qc.invalidateQueries({ queryKey: ['social','posts', postId] });
    },
  });
}


