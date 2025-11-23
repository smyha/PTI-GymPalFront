'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { settingsApi } from '@/features/settings/api/api';
import { useAuthStore } from '@/lib/store/auth.store';
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

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // General Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState('yes');
  const [pushNotifications, setPushNotifications] = useState('no');

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [workoutVisibility, setWorkoutVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [showStats, setShowStats] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load settings on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [settings, notifications, privacy] = await Promise.all([
          settingsApi.getSettings().catch(() => null),
          settingsApi.getNotificationSettings().catch(() => null),
          settingsApi.getPrivacySettings().catch(() => null),
        ]);

        if (!mounted) return;

        if (settings) {
          setTheme(settings.theme || 'auto');
          setLanguage(settings.language || 'en');
          setTimezone(settings.timezone || 'UTC');
        }
        if (notifications) {
          setEmailNotifications(notifications.email === true || notifications.email === 'yes' ? 'yes' : 'no');
          setPushNotifications(notifications.push === true || notifications.push === 'yes' ? 'yes' : 'no');
        }
        if (privacy) {
          setProfileVisibility(privacy.profileVisibility || 'public');
          setWorkoutVisibility(privacy.workoutVisibility || 'friends');
          setShowStats(privacy.showStats !== undefined ? privacy.showStats : true);
        }
      } catch (err) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingsApi.updateSettings({ theme, language, timezone });
      if (language !== i18n.language) {
        i18n.changeLanguage(language);
      }
      setSuccess(t('profile.settings.generalSettingsSaved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || t('profile.settings.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingsApi.updateNotificationSettings({
        email: emailNotifications === 'yes',
        push: pushNotifications === 'yes',
      });
      setSuccess(t('profile.settings.notificationSettingsSaved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || t('profile.settings.errorSavingNotifications'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingsApi.updatePrivacySettings({
        profileVisibility,
        workoutVisibility,
        showStats,
      });
      setSuccess(t('profile.settings.privacySettingsSaved'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || t('profile.settings.errorSavingPrivacy'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      setError('');
      
      // Get user ID from auth store
      const userId = user?.id;
      
      if (!userId) {
        throw new Error(t('profile.settings.errorDeleting'));
      }

      // Call the delete account endpoint
      await settingsApi.deleteAccount(userId);

      // Clear all authentication data and tokens
      // Use logout from auth store to clear tokens properly (clears tokens, cookies, and API clients)
      logout();

      // Clear all localStorage items related to session
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-store'); // Clear persisted auth store

      // Clear sessionStorage as well
      sessionStorage.clear();

      // Close dialog
      setShowDeleteWarning(false);
      
      // Force a full page reload and redirect to landing page to ensure all state is cleared
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.message || t('profile.settings.errorDeleting'));
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">{t('profile.settings.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('profile.settings.description')}</p>
        </div>
        <Link href="/profile">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
            {t('common.back')}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              {t('profile.settings.generalSettings')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.generalDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.theme')}</Label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="light">{t('profile.settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('profile.settings.dark')}</SelectItem>
                  <SelectItem value="auto">{t('profile.settings.auto')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.language')}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="ca">Català</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.timezone')}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                  <SelectItem value="EST">EST (UTC-5)</SelectItem>
                  <SelectItem value="CST">CST (UTC-6)</SelectItem>
                  <SelectItem value="MST">MST (UTC-7)</SelectItem>
                  <SelectItem value="PST">PST (UTC-8)</SelectItem>
                  <SelectItem value="CET">CET (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveGeneralSettings} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? t('profile.settings.saving') : t('profile.settings.saveChanges')}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              {t('profile.settings.notifications')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.notificationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.emailNotifications')}</Label>
              <Select value={emailNotifications} onValueChange={setEmailNotifications}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="yes">{t('common.yes')}</SelectItem>
                  <SelectItem value="no">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.pushNotifications')}</Label>
              <Select value={pushNotifications} onValueChange={setPushNotifications}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="yes">{t('common.yes')}</SelectItem>
                  <SelectItem value="no">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveNotifications} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? t('profile.settings.saving') : t('profile.settings.saveChanges')}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              {t('profile.settings.privacy')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.privacyDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.profileVisibility')}</Label>
              <Select value={profileVisibility} onValueChange={(value: any) => setProfileVisibility(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="public">{t('profile.settings.public')}</SelectItem>
                  <SelectItem value="friends">{t('profile.settings.friendsOnly')}</SelectItem>
                  <SelectItem value="private">{t('profile.settings.private')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.workoutVisibility')}</Label>
              <Select value={workoutVisibility} onValueChange={(value: any) => setWorkoutVisibility(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="public">{t('profile.settings.public')}</SelectItem>
                  <SelectItem value="friends">{t('profile.settings.friendsOnly')}</SelectItem>
                  <SelectItem value="private">{t('profile.settings.private')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-slate-900 dark:text-white">{t('profile.settings.showStatistics')}</Label>
              <Switch checked={showStats} onCheckedChange={setShowStats} />
            </div>

            <Button onClick={handleSavePrivacy} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? t('profile.settings.saving') : t('profile.settings.saveChanges')}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('profile.settings.dangerZone')}
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              {t('profile.settings.dangerDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => setShowDeleteWarning(true)}
            >
              {t('profile.settings.deleteAccount')}
            </Button>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              {t('profile.settings.deleteAccountWarning')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Warning Dialog */}
      <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400">{t('profile.settings.deleteAccountTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.deleteAccountDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount ? t('profile.settings.deleting') : t('profile.settings.yesDeleteAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
