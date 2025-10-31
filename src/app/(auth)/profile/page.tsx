'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, Settings, Award, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { http } from '@/lib/http';

export default function ProfilePage() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isEditStatsDialogOpen, setIsEditStatsDialogOpen] = useState(false);
  const [editedStats, setEditedStats] = useState({ weight: '', height: '', age: '' });
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  useEffect(() => {
    let mounted = true;
    // Only fetch if profile is null (don't refetch on navigation)
    if (profile !== null) return;
    
    (async () => {
      try {
        // Try /api/v1/auth/me first, fallback to /api/v1/users/profile
        let p: any = null;
        try {
          p = await http.get<any>('/api/v1/auth/me');
        } catch {
          try {
            p = await http.get<any>('/api/v1/users/profile');
          } catch {}
        }
        
        if (!mounted) return;
        
        // Extract user data from different response formats
        const userData = p?.data?.user || p?.data || p?.user || p;
        
        // Only update if we have valid user data
        if (!userData || (!userData.id && !userData.email)) {
          return;
        }
        
        // Extract user ID safely - validate it's a string and not empty
        const rawUserId = userData?.id || p?.data?.user?.id || p?.data?.id || p?.user?.id || p?.id;
        const userId = (typeof rawUserId === 'string' && rawUserId.trim() !== '') ? rawUserId : null;
        
        // Try to get personal info
        let info: any = null;
        try {
          info = await http.get<any>('/api/v1/personal/info');
        } catch {
          // If personal/info fails, don't try /api/v1/personal if it returns 500
          // Just leave info as null
        }

        if (!mounted) return;

        // Try to get user stats if profile doesn't have them AND we have a valid userId
        if (userData && !userData.stats && userId) {
          try {
            const stats = await http.get<any>(`/api/v1/users/${userId}/stats`);
            if (stats) {
              const statsData = stats?.data || stats;
              userData.stats = statsData;
            }
          } catch {
            // Silently fail - stats endpoint might not exist yet
          }
        }

        if (!mounted) return;

        // Try to get achievements ONLY if we have a valid userId
        let achievementsList: any[] = [];
        if (userId) {
          try {
            const ach = await http.get<any>(`/api/v1/users/${userId}/achievements`);
            achievementsList = Array.isArray(ach?.items) ? ach.items 
              : Array.isArray(ach?.data) ? ach.data 
              : Array.isArray(ach) ? ach 
              : [];
          } catch {
            // Silently fail - achievements endpoint might not exist yet
          }
        }

        if (!mounted) return;
        setProfile(userData);
        setPersonalInfo(info?.data || info);
        setAchievements(achievementsList);
        
        const finalInfo = info?.data || info;
        setEditedStats({
          weight: finalInfo?.weight_kg ?? '',
          height: finalInfo?.height_cm ?? '',
          age: finalInfo?.age ?? '',
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    })();
    return () => { mounted = false; };
  }, [profile]);

  const name = profile?.fullName || profile?.full_name || profile?.name || profile?.username || (profile ? t('common.loading') : '');
  const email = profile?.email || '';
  const avatar = profile?.avatar || profile?.avatar_url || null;
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '';
  // User profile returns: { stats: { totalWorkouts, totalExercises, totalPosts } }
  const workoutCount = profile?.stats?.totalWorkouts || 0;
  const exerciseCount = profile?.stats?.totalExercises || 0;
  const postCount = profile?.stats?.totalPosts || 0;

  const bmi = useMemo(() => {
    const w = Number(personalInfo?.weight_kg ?? editedStats.weight);
    const h = Number(personalInfo?.height_cm ?? editedStats.height);
    if (!w || !h) return '';
    const m = h / 100;
    return (w / (m * m)).toFixed(1);
  }, [personalInfo, editedStats]);

  const handleSaveStats = async () => {
    // Prevent multiple simultaneous requests
    if (isSavingStats) return;
    
    try {
      setIsSavingStats(true);
      const weight = editedStats.weight === '' ? 0 : parseFloat(String(editedStats.weight)) || 0;
      const height = editedStats.height === '' ? 0 : parseInt(String(editedStats.height)) || 0;
      const age = editedStats.age === '' ? 0 : parseInt(String(editedStats.age)) || 0;
      
      await http.put('/api/v1/personal/info', {
        weight_kg: weight,
        height_cm: height,
        age: age,
      });
      setPersonalInfo({ ...(personalInfo || {}), weight_kg: weight, height_cm: height, age: age });
      setIsEditStatsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving stats:', err);
      const errorMessage = err?.response?.data?.error?.message || err?.message || t('errors.saveError');
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsSavingStats(false);
    }
  };

  const handleOpenEditStats = () => {
    setEditedStats({
      weight: personalInfo?.weight_kg ? String(personalInfo.weight_kg) : '',
      height: personalInfo?.height_cm ? String(personalInfo.height_cm) : '',
      age: personalInfo?.age ? String(personalInfo.age) : '',
    });
    setIsEditStatsDialogOpen(true);
  };

  return (
    <>
    <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Perfil Personal</h1>
            <p className="text-slate-600 dark:text-slate-400">Gestiona tu información y preferencias</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile/settings">
              <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-slate-900 dark:text-white text-2xl mb-1">{name}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{email}</p>
                <div className="flex gap-4">
                  {memberSince && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Miembro desde</p>
                      <p className="text-slate-900 dark:text-white">{memberSince}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Estadísticas Físicas
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleOpenEditStats} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Peso</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.weight_kg ?? '—'} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Altura</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.height_cm ?? '—'} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Edad</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.age ?? '—'} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">IMC</span>
                <span className="text-slate-900 dark:text-white">{bmi || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total entrenamientos</span>
                <span className="text-slate-900 dark:text-white">{workoutCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total ejercicios</span>
                <span className="text-slate-900 dark:text-white">{exerciseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total publicaciones</span>
                <span className="text-slate-900 dark:text-white">{postCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Nivel: se muestra sólo si hay datos */}
          {profile?.level && profile?.xp && (
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Nivel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-900 dark:text-white">Nivel {profile.level}</span>
                    <span className="text-slate-600 dark:text-slate-400">{profile.xp?.current} / {profile.xp?.next} XP</span>
                  </div>
                  <Progress value={Number(profile.xp?.percent || 0)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Logros Desbloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((a: any) => (
                  <div key={String(a.id || a.name)} className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-yellow-500/20">
                    <div className="text-4xl mb-2">{a.icon || '🏅'}</div>
                    <h3 className="text-slate-900 dark:text-white mb-1">{a.name || 'Achievement'}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{a.description || ''}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Stats Dialog */}
      <Dialog open={isEditStatsDialogOpen} onOpenChange={setIsEditStatsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Actualizar Estadísticas Físicas</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Actualiza tus datos físicos para un seguimiento más preciso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-slate-900 dark:text-white">Peso (kg)</Label>
              <Input 
                id="weight" 
                type="number" 
                step="0.1" 
                min="0" 
                max="500"
                value={editedStats.weight} 
                onChange={(e) => {
                  setEditedStats({ ...editedStats, weight: e.target.value });
                }} 
                placeholder="0.0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-slate-900 dark:text-white">Altura (cm)</Label>
              <Input 
                id="height" 
                type="number" 
                min="1" 
                max="300"
                value={editedStats.height} 
                onChange={(e) => {
                  setEditedStats({ ...editedStats, height: e.target.value });
                }} 
                placeholder="0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-slate-900 dark:text-white">Edad (años)</Label>
              <Input 
                id="age" 
                type="number" 
                min="13" 
                max="120"
                value={editedStats.age} 
                onChange={(e) => {
                  setEditedStats({ ...editedStats, age: e.target.value });
                }} 
                placeholder="0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" 
              />
            </div>
            {editedStats.weight && editedStats.height && Number(editedStats.weight) > 0 && Number(editedStats.height) > 0 && (
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">IMC calculado</p>
                <p className="text-2xl text-slate-900 dark:text-white">{(() => { 
                  const w = Number(editedStats.weight);
                  const h = Number(editedStats.height) / 100; 
                  return (w / (h * h)).toFixed(1); 
                })()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditStatsDialogOpen(false)} 
              disabled={isSavingStats}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveStats} 
              disabled={isSavingStats}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingStats ? t('common.loading') : t('profile.saveStats')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ open, message: errorDialog.message })}>
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
    </div>
    </>
  );
}


