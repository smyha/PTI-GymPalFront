'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function PlansPage() {
  const { t } = useTranslation();
  // Plans will be loaded from backend API when available
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch plans from backend API when endpoint is available
    // For now, show empty state
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-slate-900 dark:text-white mb-2">{t('plans.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('plans.subtitle')}</p>
      </div>

      {/* Plans */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">{t('plans.loading')}</div>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
          const Icon = plan.icon;
          const isPopular = plan.popular;

          return (
            <Card
              key={plan.id}
              className={`relative hover-lift ${
                isPopular
                  ? 'glass-card border-emerald-300 dark:border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 shadow-2xl scale-105'
                  : plan.color === 'yellow'
                  ? 'glass-card border-yellow-200 dark:border-yellow-500/30 card-gradient-yellow shadow-lg'
                  : 'glass-card border-slate-200 dark:border-slate-700 shadow-lg'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg px-4 py-1">
                    ⭐ {t('plans.mostPopular')}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg ${
                  plan.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                  plan.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  'bg-gradient-to-br from-slate-400 to-slate-600'
                }`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  <span className="text-slate-900 dark:text-white text-3xl">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-600 dark:text-slate-400">/{plan.period}</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-slate-500 dark:text-slate-500">
                      <Check className="h-5 w-5 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.price > 0 ? '/plans/checkout' : '/plans/current'}>
                  <Button
                    className={`w-full ${
                      isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.price > 0 ? t('plans.subscribe') : t('plans.currentPlan')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
        </div>
      ) : (
        <Card className="glass-card border-slate-700 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400">{t('plans.noPlans')}</p>
            <p className="text-sm text-slate-500 mt-2">{t('plans.noPlansDescription')}</p>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t('plans.faq.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-slate-900 dark:text-white mb-2">{t('plans.faq.changePlan.question')}</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('plans.faq.changePlan.answer')}
            </p>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white mb-2">{t('plans.faq.guarantee.question')}</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('plans.faq.guarantee.answer')}
            </p>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white mb-2">{t('plans.faq.payment.question')}</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('plans.faq.payment.answer')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
