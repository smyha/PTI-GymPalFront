'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Users, Calendar, TrendingUp, MessageSquare, Zap, Target, Award, CheckCircle2, Flame, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/layouts/ThemeToggle';
import LanguageToggle from '@/components/layouts/LanguageToggle';

export default function LandingPage() {
  const { t } = useTranslation();

  const stats = [
    { number: "50K+", label: t('landing.footer.description') }, // Fallback - you may want to add proper stats translations
    { number: "250K+", label: "Routines" },
    { number: "98%", label: "Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-slate-900 dark:text-white font-bold text-lg">{t('app.name')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                  {t('landing.signIn')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all">
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-white dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mb-6">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{t('landing.transformationStarts')}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                {t('landing.ultimateFitness')}<br />
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  {t('landing.fitnessPal')}
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                {t('landing.createWorkouts')}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-emerald-500/50 transition-all">
                    <Dumbbell className="h-5 w-5 mr-2" />
                    {t('landing.startFree')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-slate-300 dark:border-slate-700 px-8 py-6 text-lg hover:bg-slate-100 dark:hover:bg-slate-900">
                    {t('landing.viewDemo')}
                  </Button>
                </Link>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {stats.map((stat, idx) => (
                  <StatCard key={idx} number={stat.number} label={stat.label} />
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <img
                  src="/images/placeholder.jpg"
                  alt="Premium Workouts"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/40 to-emerald-600/40">
                  <div className="text-center">
                    <Dumbbell className="h-32 w-32 mx-auto mb-4 text-white opacity-80" />
                    <p className="text-2xl font-semibold text-white">Premium Workouts</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Goal</p>
                    <p className="text-slate-900 dark:text-white font-semibold">5 Workouts</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-500 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                    <p className="text-slate-900 dark:text-white font-semibold">45 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('landing.everythingYouNeed')}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t('landing.professionalTools')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Dumbbell} title={t('landing.customWorkouts')} description={t('landing.customWorkoutsDesc')} color="emerald" />
          <FeatureCard icon={Users} title={t('landing.socialCommunity')} description={t('landing.socialCommunityDesc')} color="blue" />
          <FeatureCard icon={Calendar} title={t('landing.smartCalendar')} description={t('landing.smartCalendarDesc')} color="purple" />
          <FeatureCard icon={TrendingUp} title={t('landing.progressTracking')} description={t('landing.progressTrackingDesc')} color="yellow" />
          <FeatureCard icon={MessageSquare} title={t('landing.aiAssistant')} description={t('landing.aiAssistantDesc')} color="emerald" />
          <FeatureCard icon={Flame} title={t('landing.workoutLibrary')} description={t('landing.workoutLibraryDesc')} color="pink" />
        </div>
      </div>

      {/* Features with Icons */}
      <div className="bg-gradient-to-br from-slate-100 dark:from-slate-900 to-slate-50 dark:to-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('landing.whyChoose')}</h2>
              <div className="space-y-6">
                <FeatureItem icon={CheckCircle2} title={t('landing.aiPowered')} description={t('landing.aiPoweredDesc')} />
                <FeatureItem icon={Trophy} title={t('landing.gamification')} description={t('landing.gamificationDesc')} />
                <FeatureItem icon={Users} title={t('landing.communitySupport')} description={t('landing.communitySupportDesc')} />
                <FeatureItem icon={TrendingUp} title={t('landing.advancedAnalytics')} description={t('landing.advancedAnalyticsDesc')} />
              </div>
            </div>
            <div className="relative w-full h-96 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl shadow-2xl overflow-hidden">
              <img
                src="/images/placeholder.jpg"
                alt={t('landing.achieveYourBest')}
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/40 to-blue-500/40">
                <div className="text-center">
                  <Trophy className="h-24 w-24 mx-auto mb-4 text-white opacity-80" />
                  <p className="text-2xl font-semibold text-white">{t('landing.achieveYourBest')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden py-24 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="absolute inset-0 opacity-10">
          <Dumbbell className="absolute h-96 w-96 -top-48 -right-48 opacity-50" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-6">{t('landing.readyTransform')}</h2>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">{t('landing.joinUsers')}</p>
          <Link href="/register">
            <Button className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold shadow-xl">
              <Dumbbell className="h-5 w-5 mr-2" />
              {t('landing.getStartedFree')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{t('app.name')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.footer.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('landing.footer.features')}</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-500">{t('workouts.title')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.company')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('progress.title')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.about')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.blog')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.terms')}</a></li>
                <li><a href="#" className="hover:text-emerald-500">{t('landing.footer.cookies')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <p className="text-center text-slate-600 dark:text-slate-400 text-sm">{t('landing.footer.allRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{number}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-950/30', icon: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' },
    pink: { bg: 'bg-pink-500/10 dark:bg-pink-950/30', icon: 'text-pink-500', border: 'border-pink-200 dark:border-pink-800' },
    blue: { bg: 'bg-blue-500/10 dark:bg-blue-950/30', icon: 'text-blue-500', border: 'border-blue-200 dark:border-blue-800' },
    purple: { bg: 'bg-purple-500/10 dark:bg-purple-950/30', icon: 'text-purple-500', border: 'border-purple-200 dark:border-purple-800' },
    yellow: { bg: 'bg-yellow-500/10 dark:bg-yellow-950/30', icon: 'text-yellow-500', border: 'border-yellow-200 dark:border-yellow-800' }
  };

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.emerald;

  return (
    <Card className={`${colors.bg} border ${colors.border} hover:shadow-lg transition-all cursor-pointer group`}>
      <CardContent className="p-6">
        <div className={`${colors.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
