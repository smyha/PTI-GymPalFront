import { http } from '@/lib/http';
import { endpoints } from '@/lib/api/endpoints';

export const socialApi = {
  // Get list of posts (feed)
  posts: (params?: { page?: number; limit?: number }) =>
    http.get<any>(endpoints.social.posts + (params ? `?${new URLSearchParams(params as any)}` : '')),
  // Get single post by ID
  post: (id: string) => http.get<any>(`${endpoints.social.postById}/${id}`),
  // Create a new post
  createPost: (body: any) => http.post<any>(endpoints.social.posts, body),
  // Delete a post
  deletePost: (id: string) => http.delete<any>(`${endpoints.social.postById}/${id}`),
  // Like a post
  like: (id: string) => http.post<any>(`${endpoints.social.postById}/${id}/like`, {}),
  // Unlike a post
  unlike: (id: string) => http.delete<any>(`${endpoints.social.postById}/${id}/like`),
  // Get comments for a post
  comments: (id: string, params?: { page?: number; limit?: number }) =>
    http.get<any>(`${endpoints.social.postById}/${id}/comments` + (params ? `?${new URLSearchParams(params as any)}` : '')),
  // Add comment to a post
  addComment: (id: string, body: { content: string; parent_comment_id?: string }) =>
    http.post<any>(`${endpoints.social.postById}/${id}/comments`, body),
  // Delete a comment
  deleteComment: (postId: string, commentId: string) =>
    http.delete<any>(`${endpoints.social.postById}/${postId}/comments/${commentId}`),
  // Follow a user
  follow: (userId: string) => http.post<any>(`/api/v1/social/users/${userId}/follow`, {}),
  // Unfollow a user
  unfollow: (userId: string) => http.post<any>(`/api/v1/social/users/${userId}/unfollow`, {}),
};


