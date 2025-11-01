'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Plus, Search, Apple, Calendar as CalIcon, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

export default function DietPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">{t('diet.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('diet.subtitle')}</p>
        </div>
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={() => {/* TODO: Open create diet modal */}}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('diet.createPlan')}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder={t('diet.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-card border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-md"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="glass-card border-slate-300 dark:border-slate-700">
          <TabsTrigger value="plans" className="text-slate-900 dark:text-white">{t('diet.myPlans')}</TabsTrigger>
          <TabsTrigger value="recipes" className="text-slate-900 dark:text-white">{t('diet.recipes')}</TabsTrigger>
          <TabsTrigger value="tracking" className="text-slate-900 dark:text-white">{t('diet.tracking')}</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Diet Plan Card */}
            <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Apple className="h-5 w-5 text-emerald-500" />
                  Plan Deficit Calórico
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  1500 {t('diet.caloriesPerDay')} • {t('diet.weightLoss')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('diet.proteins')}</span>
                    <span className="text-slate-900 dark:text-white">120g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('diet.carbohydrates')}</span>
                    <span className="text-slate-900 dark:text-white">150g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('diet.fats')}</span>
                    <span className="text-slate-900 dark:text-white">50g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4 mt-6">
          <div className="text-center py-12 text-slate-400">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('diet.recipesComingSoon')}</p>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {t('diet.today')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('diet.calories')}</span>
                    <span className="text-slate-900 dark:text-white">0 / 2000 kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('diet.proteins')}</span>
                    <span className="text-slate-900 dark:text-white">0g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <CalIcon className="h-5 w-5 text-purple-500" />
                  {t('diet.thisWeek')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {t('diet.averagePerDay')}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

