'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Heart, UserPlus, Image as ImageIcon, Search, Trash2, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { http } from '@/lib/http';
import { socialApi } from '@/features/social/api/api';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { ImageViewer } from '@/components/shared/ImageViewer';

/**
 * Post Interface representing a social feed item
 */
type Post = {
  id: string;
  content: string;
  likesCount?: number;
  commentsCount?: number;
  reposts_count?: number;
  createdAt?: string;
  image_urls?: string[];
  image_urls_?: string[];
  author?: { id: string; username?: string; fullName?: string; email?: string; avatar?: string };
  isLiked?: boolean;
  userId?: string; // ID of the post owner
  user_id?: string;
  workout_id?: string;
  workout?: {
    id: string;
    name: string;
    description?: string;
    difficulty?: string;
    duration_minutes?: number;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  author?: { id: string; username?: string; fullName?: string; avatar?: string };
  userId?: string; // ID of the comment owner
  parent_comment_id?: string | null;
  replies?: Comment[];
};

export default function SocialPage() {
  const { t } = useTranslation();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [reposted, setReposted] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [deletePostDialog, setDeletePostDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [deleteCommentDialog, setDeleteCommentDialog] = useState<{ open: boolean; postId: string | null; commentId: string | null }>({ open: false, postId: null, commentId: null });
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [publishError, setPublishError] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [postImages, setPostImages] = useState<{ url: string; alt?: string; file?: File }[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /**
   * Initialize user data on mount
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await http.get<any>('/api/v1/auth/me');
        const user = res?.data?.user || res?.data || res?.user || res;
        if (mounted && user?.id) {
          setCurrentUserId(user.id);
          setCurrentUser(user);
        }
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load user's workouts when modal opens
  useEffect(() => {
    if (!publishModalOpen) return;

    let mounted = true;
    (async () => {
      try {
        const res = await http.get<any>('/api/v1/workouts');
        // The API returns { success: true, data: { data: [...], pagination: {...} } }
        // So res is the full object. res.data is the wrapper. res.data.data is the array.
        // We try multiple paths to be robust.
        const workoutsData = res?.data?.data || res?.data?.workouts || res?.data || res?.workouts || [];
        const workouts = Array.isArray(workoutsData) ? workoutsData : (Array.isArray(res) ? res : []);
        
        if (mounted) {
          setUserWorkouts(workouts);
        }
      } catch (err) {
        console.error('Failed to load user workouts', err);
      }
    })();
    return () => { mounted = false; };
  }, [publishModalOpen]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await socialApi.posts();
        // res structure: { data: [...posts], pagination: {...} }
        const items: Post[] = res?.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        if (mounted) {
          setPosts(items);
          // Initialize liked and followed states
          const likedState: Record<string, boolean> = {};
          const followedState: Record<string, boolean> = {};

          // Collect unique author IDs to check follow status
          const authorIds = new Set<string>();

          items.forEach((post: Post) => {
            if (post.isLiked) likedState[post.id] = true;
            if (post.author?.id && currentUserId && post.author.id !== currentUserId) {
              authorIds.add(post.author.id);
            }
          });

          setLiked(likedState);

          // Check follow status for each author
          if (currentUserId) {
            await Promise.all(Array.from(authorIds).map(async (authorId) => {
              try {
                const stats = await socialApi.getFollowStats(authorId);
                if (stats.isFollowing) {
                  followedState[authorId] = true;
                }
              } catch (e) {
                // ignore
              }
            }));
          }

          if (mounted) {
            setFollowed(followedState);
          }
        }
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, [currentUserId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const authorName = (post.author?.fullName || post.author?.username || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      return authorName.includes(q) || content.includes(q);
    });
  }, [posts, searchQuery]);

  const handlePublishPost = async () => {
    if (!postContent.trim()) return;
    setLoading(true);
    setPublishError('');
    try {
      // Check if we have file uploads
      const hasFileUploads = imageFiles.length > 0;
      let newPost: Post;

      if (hasFileUploads) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('content', postContent);
        formData.append('is_public', 'true');
        if (selectedWorkoutId) {
          formData.append('workout_id', selectedWorkoutId);
        }

        // Add all image files
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        // Call API with FormData (don't set Content-Type header - browser will set it with correct boundary)
        const res = await http.post<Post>('/api/v1/social/posts', formData);
        newPost = (res as any)?.data || res;
      } else {
        // Use regular JSON for URL-only images
        const res = await socialApi.createPost({
          content: postContent,
          images: postImages.length > 0 ? postImages.map(img => ({ url: img.url, alt: img.alt })) : undefined,
          workout_id: selectedWorkoutId || undefined,
          is_public: true,
        });
        newPost = res as Post;
      }

      // Add current user info to the new post for immediate display
      if (currentUser) {
        newPost.author = {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.full_name || currentUser.fullName,
          email: currentUser.email,
          avatar: currentUser.avatar_url || currentUser.avatar
        };
      }

      // Add workout info if selected
      if (selectedWorkoutId) {
         const selectedWorkout = userWorkouts.find(w => w.id === selectedWorkoutId);
         if (selectedWorkout) {
             newPost.workout = {
                 id: selectedWorkout.id,
                 name: selectedWorkout.name,
                 description: selectedWorkout.description,
                 difficulty: selectedWorkout.difficulty,
                 duration_minutes: selectedWorkout.duration_minutes
             };
         }
      }

      setPosts((prev) => [newPost, ...prev]);

      setPostContent('');
      setPostImages([]);
      setImageFiles([]);
      setSelectedWorkoutId(null);
      setImageUrl('');
      setPublishModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Error al publicar';
      setPublishError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setPostImages([...postImages, { url: imageUrl, alt: '' }]);
    setImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.filter((file) => file.type.startsWith('image/'));

    if (newFiles.length !== files.length) {
      setErrorDialog({ open: true, message: 'Only image files are allowed' });
    }

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPostImages((prev) => [...prev, { url, alt: file.name, file }]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setPostImages(postImages.filter((_, i) => i !== index));
  };

  const handleLike = async (postId: string) => {
    try {
      await socialApi.like(postId);
      setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
      // Refetch the post to get updated like count
      try {
        const res = await socialApi.posts();
        const items: Post[] = res?.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const updatedPost = items.find((p: Post) => p.id === postId);
        if (updatedPost) {
          setPosts((prev) => prev.map((p) => p.id === postId ? updatedPost : p));
        }
      } catch (err) {
      }
    } catch (err) {
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      await socialApi.repost(postId);
      setReposted((prev) => ({ ...prev, [postId]: !prev[postId] }));
      // Refetch the post to get updated repost count
      try {
        const res = await socialApi.posts();
        const items: Post[] = res?.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const updatedPost = items.find((p: Post) => p.id === postId);
        if (updatedPost) {
          setPosts((prev) => prev.map((p) => p.id === postId ? updatedPost : p));
        }
      } catch (err) {
      }
    } catch (err) {
    }
  };

  const handleFollow = async (userId: string) => {
    if (currentUserId && userId === currentUserId) {
      setErrorDialog({ open: true, message: t('social.cannotFollowSelf') });
      return;
    }
    try {
      await socialApi.follow(userId);
      setFollowed((prev) => ({ ...prev, [userId]: !prev[userId] }));
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.followError');
      try {
        const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
        setErrorDialog({ open: true, message: parsed?.error?.message || msg });
      } catch {
        setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.followError') });
      }
    }
  };

  const handleDeletePost = async () => {
    const postId = deletePostDialog.postId;
    if (!postId) return;
    try {
      await socialApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletePostDialog({ open: false, postId: null });
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.deletePostError');
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.deletePostError') });
    }
  };

  const handleLoadComments = async (postId: string) => {
    if (comments[postId]) {
      setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
      return;
    }
    setLoading(true);
    try {
      const res = await socialApi.comments(postId);
      const items = Array.isArray(res) ? res : [];
      // Map user_id to userId for consistent field naming
      const mappedComments = items.map((comment: any) => ({
        ...comment,
        userId: comment.userId || comment.user_id, // Support both field names
        createdAt: comment.createdAt || comment.created_at,
        updatedAt: comment.updatedAt || comment.updated_at,
      }));
      setComments((prev) => ({ ...prev, [postId]: mappedComments }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    const { postId, commentId } = deleteCommentDialog;
    if (!postId || !commentId) return;
    try {
      await socialApi.deleteComment(postId, commentId);
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId && !c.replies?.some((r) => r.id === commentId)),
      }));
      setDeleteCommentDialog({ open: false, postId: null, commentId: null });
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.deleteCommentError');
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.deleteCommentError') });
    }
  };

  const handlePostComment = async (postId: string) => {
    const content = commentContent[postId];
    if (!content?.trim()) return;
    setLoading(true);
    try {
      const newComment = await socialApi.createComment(postId, { content });
      // Map user_id to userId for consistent field naming
      const mappedComment = {
        ...(newComment as any),
        userId: (newComment as any).userId || newComment.user_id,
        createdAt: (newComment as any).createdAt || newComment.created_at,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), mappedComment],
      }));
      setCommentContent((prev) => ({ ...prev, [postId]: '' }));
      // Refetch posts to update comment count
      try {
        const res = await socialApi.posts();
        const items: Post[] = res?.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setPosts(items);
      } catch (err) {
      }
    } catch (err: any) {
      const msg = err?.message || 'Error posting comment';
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : 'Error posting comment' });
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (postId: string, parentCommentId: string) => {
    if (!replyContent?.trim()) return;
    setLoading(true);
    try {
      const newReply = await socialApi.createComment(postId, {
        content: replyContent,
        parent_comment_id: parentCommentId
      });

      // Map user_id to userId for consistent field naming
      const mappedReply = {
        ...(newReply as any),
        userId: (newReply as any).userId || newReply.user_id,
        createdAt: (newReply as any).createdAt || newReply.created_at,
      };

      // Update the comments to add the reply to the parent comment
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), mappedReply],
            };
          }
          return comment;
        }),
      }));

      setReplyContent('');
      setReplyingTo(null);

      // Refetch posts to update comment count
      try {
        const res = await socialApi.posts();
        const items: Post[] = res?.data && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setPosts(items);
      } catch (err) {
      }
    } catch (err: any) {
      const msg = err?.message || 'Error posting reply';
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : 'Error posting reply' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWorkout = async (workoutId: string) => {
    if (!workoutId) {
      setErrorDialog({ open: true, message: 'Workout ID is missing' });
      return;
    }
    setLoading(true);
    try {
      const res = await http.post<any>(`/api/v1/workouts/copy/${workoutId}`);
      const copiedWorkout = res?.data?.data || res?.data || res;

      setErrorDialog({
        open: true,
        message: `✅ Workout "${copiedWorkout?.name || 'Copied Workout'}" has been copied to your workouts!`
      });

      // Optionally redirect to workouts page or refresh
      // window.location.href = '/workouts';
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to copy workout';
      
      let displayMsg = typeof msg === 'string' ? msg : 'Failed to copy workout';
      
      if (displayMsg.includes('NOT_FOUND') || displayMsg.includes('not found')) {
           displayMsg = t('social.workoutNotFoundOrPrivate') || "Workout not found or is private.";
      } else if (displayMsg.includes('DATABASE_ERROR')) {
           displayMsg = t('errors.databaseError') || "A database error occurred. Please try again.";
      }

      setErrorDialog({
        open: true,
        message: displayMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
          <LoadingSpinner size="lg" variant="dumbbell" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Social Feed</h1>
          <p className="text-slate-600 dark:text-slate-400">Connect with the GymPal community</p>
        </div>
        <Button onClick={() => setPublishModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <Card key={post.id} className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {(post.author?.fullName || post.author?.username || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-medium">
                      {post.author?.username || post.author?.fullName || 'Usuario'}
                    </h3>
                    {post.createdAt && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUserId && post.author?.id && post.author.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFollow(post.author!.id!)}
                      className={followed[post.author.id] ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {followed[post.author.id] ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  {currentUserId && post.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletePostDialog({ open: true, postId: post.id })}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900 dark:text-white mb-4">{post.content}</p>

              {/* Images */}
              {post.image_urls && post.image_urls.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.image_urls.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Post image ${idx + 1}`}
                      onClick={() => setPreviewImage(url)}
                      className="max-h-64 max-w-full rounded border border-slate-300 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Workout Reference */}
              {(post.workout || post.workout_id) && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">📋 Referenced Workout</p>
                    {post.workout?.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 capitalize">
                        {post.workout.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {post.workout?.name || `Workout ID: ${post.workout_id}`}
                  </p>
                  {post.workout?.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {post.workout.description}
                    </p>
                  )}
                  <Button
                    onClick={() => handleCopyWorkout(post.workout?.id || post.workout_id!)}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 h-auto py-1 px-2 text-xs"
                  >
                    📋 Copy This Workout
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={liked[post.id] || post.isLiked ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked[post.id] || post.isLiked ? 'fill-pink-500' : ''}`} />
                  {(post.likesCount ?? 0) + ((liked[post.id] && !post.isLiked) ? 1 : 0)}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400"
                  onClick={() => handleLoadComments(post.id)}
                >
                  {post.commentsCount ?? 0} comments
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRepost(post.id)}
                  className={reposted[post.id] ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'}
                >
                  <Repeat2 className={`h-4 w-4 mr-2 ${reposted[post.id] ? 'fill-emerald-500' : ''}`} />
                  {(post.reposts_count || 0) + (reposted[post.id] ? 1 : 0)}
                </Button>
              </div>
              {/* Comments Section */}
              {showComments[post.id] && comments[post.id] && (
                <div className="mt-4 space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar} />
                        <AvatarFallback className="bg-pink-500 text-white text-xs">
                          {(comment.author?.fullName || comment.author?.username || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {comment.author?.username || comment.author?.fullName || 'Usuario'}
                          </span>
                          <div className="flex items-center gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => setReplyingTo({ postId: post.id, commentId: comment.id })}
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                            {currentUserId && (comment.userId === currentUserId || post.userId === currentUserId) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => setDeleteCommentDialog({ open: true, postId: post.id, commentId: comment.id })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                        {comment.createdAt && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        )}
                        {/* Reply Input Form */}
                        {replyingTo?.commentId === comment.id && replyingTo?.postId === post.id && (
                          <div className="mt-2 ml-4 space-y-2 pt-2 border-l-2 border-emerald-500 pl-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={t('social.writeReply')}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostReply(post.id, comment.id);
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                              />
                              <Button
                                onClick={() => handlePostReply(post.id, comment.id)}
                                disabled={!replyContent?.trim()}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-auto px-2 py-1 text-xs"
                              >
                                {t('social.reply')}
                              </Button>
                              <Button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                variant="outline"
                                size="sm"
                                className="border-slate-300 dark:border-slate-700 h-auto px-2 py-1 text-xs"
                              >
                                {t('social.cancel')}
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2 ml-4 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {comment.replies?.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.author?.avatar} />
                                  <AvatarFallback className="bg-pink-500 text-white text-xs">
                                    {(reply.author?.fullName || reply.author?.username || 'U').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-slate-900 dark:text-white">
                                      {reply.author?.username || reply.author?.fullName || 'Usuario'}
                                    </span>
                                    {currentUserId && (reply.userId === currentUserId || post.userId === currentUserId) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 ml-auto"
                                        onClick={() => setDeleteCommentDialog({ open: true, postId: post.id, commentId: reply.id })}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300">{reply.content}</p>
                                  {reply.createdAt && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {new Date(reply.createdAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Add Comment Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentContent[post.id] || ''}
                      onChange={(e) =>
                        setCommentContent((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePostComment(post.id);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Button
                      onClick={() => handlePostComment(post.id)}
                      disabled={!commentContent[post.id]?.trim()}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-slate-400">No posts yet.</div>
        )}
      </div>

      {/* Publish Post Modal */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Create Post</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Share your progress with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What do you want to share?"
              className="min-h-[200px] bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              value={postContent}
              onChange={(e) => {
                setPostContent(e.target.value);
                if (publishError) setPublishError('');
              }}
            />
            {publishError && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded p-2">
                {publishError}
              </div>
            )}

            {/* Image Upload Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">Add Images</label>
              <div className="space-y-2">
                {/* File Upload */}
                <div className="flex gap-2">
                  <label className="flex-1 px-3 py-2 bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload images from your computer
                    </span>
                  </label>
                </div>

                {/* URL Input (Alternative) */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Or paste image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <Button
                    onClick={handleAddImage}
                    disabled={!imageUrl.trim()}
                    size="sm"
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Display added images */}
              {postImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt || `Image ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded border border-slate-300 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e2e8f0" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23475569"%3EBroken%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <Button
                        onClick={() => handleRemoveImage(idx)}
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workout Reference */}
            <div className="space-y-2">
              <label htmlFor="workout-select" className="text-sm font-medium text-slate-900 dark:text-white">Reference Workout (optional)</label>
              <select
                id="workout-select"
                value={selectedWorkoutId || ''}
                onChange={(e) => setSelectedWorkoutId(e.target.value || null)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- No workout --</option>
                {(Array.isArray(userWorkouts) ? userWorkouts : []).map((workout: any) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.name} ({workout.difficulty || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={handlePublishPost}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                disabled={!postContent.trim() || loading}
              >
                {loading ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open: boolean) => setErrorDialog({ open, message: errorDialog.message })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('errors.error')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: '' })} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {t('common.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Post Dialog */}
      <AlertDialog open={deletePostDialog.open} onOpenChange={(open: boolean) => setDeletePostDialog({ open, postId: deletePostDialog.postId })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('social.confirmDeletePost')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('social.confirmDeletePostDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePostDialog({ open: false, postId: null })} className="border-border text-foreground hover:bg-accent">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-500 hover:bg-red-600 text-white">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Dialog */}
      <AlertDialog open={deleteCommentDialog.open} onOpenChange={(open: boolean) => setDeleteCommentDialog({ open, postId: deleteCommentDialog.postId, commentId: deleteCommentDialog.commentId })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('social.confirmDeleteComment')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('social.confirmDeleteCommentDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCommentDialog({ open: false, postId: null, commentId: null })} className="border-border text-foreground hover:bg-accent">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-500 hover:bg-red-600 text-white">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Image Preview Viewer */}
      {previewImage && (
        <ImageViewer
          src={previewImage}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
