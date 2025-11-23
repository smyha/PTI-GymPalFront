import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

export type CreatePostRequest = {
  content: string;
  images?: { url: string; alt?: string }[];
  workout_id?: string;
  tags?: string[];
  is_public?: boolean;
};

export type CreateCommentRequest = {
  content: string;
  parent_comment_id?: string;
};

/**
 * List social posts
 */
export async function listPosts(page: number = 1, limit: number = 20) {
  apiLogger.info({ endpoint: '/api/v1/social/posts', page, limit }, 'List posts request');
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await http.get<any>(`/api/v1/social/posts?${params}`);

    // Backend returns: { success: true, data: [...posts], pagination: {...}, metadata: {...} }

    if (!response || !response.data) throw new Error('No posts in response');

    // Return the data with posts array and pagination
    apiLogger.info({}, 'List posts success');
    return {
      data: response.data || [],
      pagination: response.pagination || { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
    };
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
    const wrappedRes = await http.post<ApiResponse<Unified.Post>>('/api/v1/social/posts', request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No post in response');

    // Transform post
    const transformed = transformers.postTransformers.transformPost(rawData);
    apiLogger.info({}, 'Create post success');
    return transformed;
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
    const wrappedRes = await http.get<ApiResponse<Unified.Post>>(`/api/v1/social/posts/${postId}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No post in response');

    // Transform post
    const transformed = transformers.postTransformers.transformPost(rawData);
    apiLogger.info({}, 'Get post success');
    return transformed;
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
    const wrappedRes = await http.put<ApiResponse<Unified.Post>>(`/api/v1/social/posts/${postId}`, request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No post in response');

    // Transform post
    const transformed = transformers.postTransformers.transformPost(rawData);
    apiLogger.info({}, 'Update post success');
    return transformed;
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
    const wrappedRes = await http.get<ApiResponse<Unified.PostComment[]>>(`/api/v1/social/posts/${postId}/comments`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No comments in response');

    // Transform comments
    const transformed = transformers.postTransformers.transformComments(rawData);
    apiLogger.info({}, 'List post comments success');
    return transformed;
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
    const wrappedRes = await http.post<ApiResponse<Unified.PostComment>>(`/api/v1/social/posts/${postId}/comments`, request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No comment in response');

    // Transform comment
    const transformed = transformers.postTransformers.transformComment(rawData);
    apiLogger.info({}, 'Create post comment success');
    return transformed;
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
 * Toggle repost a post
 */
export async function togglePostRepost(postId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/posts/${postId}/repost` }, 'Toggle post repost request');
  try {
    const wrappedRes = await http.post<ApiResponse<{ reposted: boolean }>>(`/api/v1/social/posts/${postId}/repost`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No repost status in response');
    apiLogger.info({}, 'Toggle post repost success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/posts/${postId}/repost` });
    throw err;
  }
}

/**
 * Get follow stats for a user
 */
export async function getFollowStats(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/users/${userId}/stats` }, 'Get follow stats request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ followersCount: number; followingCount: number; isFollowing: boolean }>>(`/api/v1/social/users/${userId}/stats`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No stats in response');
    apiLogger.info({}, 'Get follow stats success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/users/${userId}/stats` });
    throw err;
  }
}

/**
 * Get post count for a user
 */
export async function getPostCount(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/social/users/${userId}/posts/count` }, 'Get post count request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ count: number }>>(`/api/v1/social/users/${userId}/posts/count`);
    const data = wrappedRes?.data;
    if (data === undefined) throw new Error('No count in response');
    apiLogger.info({}, 'Get post count success');
    return data.count;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/users/${userId}/posts/count` });
    throw err;
  }
}

/**
 * Get user's reposts
 */
export async function getUserReposts(userId: string, page: number = 1, limit: number = 20) {
  apiLogger.info({ endpoint: `/api/v1/social/users/${userId}/reposts`, page, limit }, 'Get user reposts request');
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const wrappedRes = await http.get<any>(`/api/v1/social/users/${userId}/reposts?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No reposts in response');
    
    apiLogger.info({}, 'Get user reposts success');
    return {
      data: data || [],
      pagination: wrappedRes.pagination
    };
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/social/users/${userId}/reposts` });
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
  repost: togglePostRepost,
  getUserReposts: getUserReposts,
  comments: listPostComments,
  createComment: createPostComment,
  deleteComment: deletePostComment,
  follow: followUser,
  unfollow: unfollowUser,
  getFollowStats: getFollowStats,
  getPostCount: getPostCount,
};
