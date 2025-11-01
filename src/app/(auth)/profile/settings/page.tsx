'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Shield, Globe, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function SettingsPage() {
  const { t } = useTranslation();

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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              {t('profile.settings.notifications')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.notificationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('common.comingSoon')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              {t('profile.settings.privacy')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.privacyDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('common.comingSoon')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              {t('profile.settings.language')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('profile.settings.languageHint')}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-500" />
              {t('profile.settings.appearance')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.settings.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('common.comingSoon')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
