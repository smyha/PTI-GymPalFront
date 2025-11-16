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
          setTheme(settings.theme);
          setLanguage(settings.language);
          setTimezone(settings.timezone);
        }
        if (notifications) {
          setEmailNotifications(notifications.email ? 'yes' : 'no');
          setPushNotifications(notifications.push ? 'yes' : 'no');
        }
        if (privacy) {
          setProfileVisibility(privacy.profileVisibility);
          setWorkoutVisibility(privacy.workoutVisibility);
          setShowStats(privacy.showStats);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
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
      setSuccess('General settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error saving settings');
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
      setSuccess('Notification settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error saving notification settings');
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
      setSuccess('Privacy settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error saving privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      setError('');
      // Call the delete account endpoint
      await settingsApi.deleteAccount();

      // Clear localStorage and redirect to login
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('access_token');

      // Close dialog and redirect
      setShowDeleteWarning(false);
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Error deleting account');
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
        </div>
        <Link href="/profile">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
            Back
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
              General Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Theme, language and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Theme</Label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Language</Label>
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
              <Label className="text-slate-900 dark:text-white">Timezone</Label>
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
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notifications
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Email Notifications</Label>
              <Select value={emailNotifications} onValueChange={setEmailNotifications}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Push Notifications</Label>
              <Select value={pushNotifications} onValueChange={setPushNotifications}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveNotifications} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Privacy
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Control your visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Profile Visibility</Label>
              <Select value={profileVisibility} onValueChange={(value: any) => setProfileVisibility(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Workout Visibility</Label>
              <Select value={workoutVisibility} onValueChange={(value: any) => setWorkoutVisibility(value)}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-slate-900 dark:text-white">Show Statistics</Label>
              <Switch checked={showStats} onCheckedChange={setShowStats} />
            </div>

            <Button onClick={handleSavePrivacy} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Irreversible actions that will affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => setShowDeleteWarning(true)}
            >
              Delete Account Permanently
            </Button>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              This action cannot be undone. All your data, workouts, posts and settings will be deleted.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Warning Dialog */}
      <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Account Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              This action is irreversible. All your data, workouts, posts and settings will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
