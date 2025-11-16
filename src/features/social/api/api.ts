import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type PostImage = {
  url: string;
  alt?: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_urls?: PostImage[];
  workout_id?: string;
  hashtags?: string[];
  is_public: boolean;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
};

export type CreatePostRequest = {
  content: string;
  images?: PostImage[];
  workout_id?: string;
  tags?: string[];
  is_public?: boolean;
};

export type CreateCommentRequest = {
  content: string;
  parent_comment_id?: string;
};

export type PaginatedPosts = {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * List social posts
 */
export async function listPosts(page: number = 1, limit: number = 20) {
  apiLogger.info({ endpoint: '/api/v1/social/posts', page, limit }, 'List posts request');
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const wrappedRes = await http.get<ApiResponse<PaginatedPosts>>(`/api/v1/social/posts?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No posts in response');
    apiLogger.info({}, 'List posts success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/social/posts' });
    throw err;
  }
}

/**
 * Create new post
 */
export async function createPost(request: CreatePostRequest) {
  apiLogger.info({ endpoint: '/api/v1/social/posts' }, 'Create post request');
  try {
    const wrappedRes = await http.post<ApiResponse<Post>>('/api/v1/social/posts', request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No post in response');
    apiLogger.info({}, 'Create post success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/social/posts' });
    throw err;
  }
}

/**
 * Get post by ID
 */
export async function getPost(postId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}` }, 'Get post request');
  try {
    const wrappedRes = await http.get<ApiResponse<Post>>(`/api/v1/social/posts/${postId}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No post in response');
    apiLogger.info({}, 'Get post success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}` });
    throw err;
  }
}

/**
 * Update post
 */
export async function updatePost(postId: string, request: Partial<CreatePostRequest>) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}` }, 'Update post request');
  try {
    const wrappedRes = await http.put<ApiResponse<Post>>(`/api/v1/social/posts/${postId}`, request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No post in response');
    apiLogger.info({}, 'Update post success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}` });
    throw err;
  }
}

/**
 * Delete post
 */
export async function deletePost(postId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}` }, 'Delete post request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/social/posts/${postId}`);
    apiLogger.info({}, 'Delete post success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}` });
    throw err;
  }
}

/**
 * Like/unlike post
 */
export async function togglePostLike(postId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}/like` }, 'Toggle post like request');
  try {
    const wrappedRes = await http.post<ApiResponse<{ liked: boolean }>>(`/api/v1/social/posts/${postId}/like`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No like status in response');
    apiLogger.info({}, 'Toggle post like success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}/like` });
    throw err;
  }
}

/**
 * List post comments
 */
export async function listPostComments(postId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}/comments` }, 'List post comments request');
  try {
    const wrappedRes = await http.get<ApiResponse<Comment[]>>(`/api/v1/social/posts/${postId}/comments`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No comments in response');
    apiLogger.info({}, 'List post comments success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}/comments` });
    throw err;
  }
}

/**
 * Create post comment
 */
export async function createPostComment(postId: string, request: CreateCommentRequest) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}/comments` }, 'Create post comment request');
  try {
    const wrappedRes = await http.post<ApiResponse<Comment>>(`/api/v1/social/posts/${postId}/comments`, request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No comment in response');
    apiLogger.info({}, 'Create post comment success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}/comments` });
    throw err;
  }
}

/**
 * Delete post comment
 */
export async function deletePostComment(postId: string, commentId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}/comments/${commentId}` }, 'Delete post comment request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/social/posts/${postId}/comments/${commentId}`);
    apiLogger.info({}, 'Delete post comment success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}/comments/${commentId}` });
    throw err;
  }
}

/**
 * Follow user
 */
export async function followUser(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/users/${userId}/follow` }, 'Follow user request');
  try {
    await http.post<ApiResponse<any>>(`/api/v1/social/users/${userId}/follow`);
    apiLogger.info({}, 'Follow user success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/users/${userId}/follow` });
    throw err;
  }
}

/**
 * Unfollow user
 */
export async function unfollowUser(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/users/${userId}/unfollow` }, 'Unfollow user request');
  try {
    await http.post<ApiResponse<any>>(`/api/v1/social/users/${userId}/unfollow`);
    apiLogger.info({}, 'Unfollow user success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/users/${userId}/unfollow` });
    throw err;
  }
}

/**
 * Social API object for convenience
 */
export const socialApi = {
  posts: listPosts,
  createPost: createPost,
  getPost: getPost,
  updatePost: updatePost,
  deletePost: deletePost,
  like: togglePostLike,
  comments: listPostComments,
  createComment: createPostComment,
  deleteComment: deletePostComment,
  follow: followUser,
  unfollow: unfollowUser,
};
