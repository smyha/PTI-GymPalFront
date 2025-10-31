'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { http } from '@/lib/http';
import { socialApi } from '@/features/social/api/api';
import { useTranslation } from 'react-i18next';

export default function UserProfilePage() {
  const { t } = useTranslation();
  const params = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          http.get<any>(`/api/v1/users/${params.userId}`).catch(() => null),
          socialApi.posts().catch(() => null),
        ]);
        if (!mounted) return;
        
        if (userRes) {
          const userData = userRes?.data?.user || userRes?.data || userRes?.user || userRes;
          setUser(userData);
        }
        
        if (postsRes) {
          const allPosts = postsRes?.data?.posts || postsRes?.posts || postsRes?.data || (Array.isArray(postsRes) ? postsRes : []);
          const userPosts = allPosts.filter((p: any) => p.userId === params.userId || p.author?.id === params.userId);
          setPosts(userPosts);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params.userId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  const userName = user?.fullName || user?.full_name || user?.username || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.avatar || user?.avatar_url || null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/social">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      {/* User Profile Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-slate-900 dark:text-white text-2xl mb-1">{userName}</h2>
              <p className="text-slate-600 dark:text-slate-400">{userEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Posts */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('social.posts')}</h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post.id} className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white text-sm">
                    {new Date(post.createdAt || Date.now()).toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900 dark:text-white">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400">{t('social.noPosts')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
