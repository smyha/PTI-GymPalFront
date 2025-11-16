export type User = {
  id: string;
  username?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
};

export type Post = {
  id: string;
  content: string;
  author?: User;
  userId?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  isLiked?: boolean;
};

export type Comment = {
  id: string;
  content: string;
  author?: User;
  userId?: string;
  postId?: string;
  parent_comment_id?: string | null;
  replies?: Comment[];
  createdAt?: string;
};

export type CreatePostRequest = {
  content: string;
  images?: Array<{
    url: string;
    alt?: string;
  }>;
  workout_id?: string;
  tags?: string[];
  is_public?: boolean;
};

export type CreateCommentRequest = {
  content: string;
  parent_comment_id?: string;
};

export type PostFilters = {
  page?: number;
  limit?: number;
  user_id?: string;
  search?: string;
};
