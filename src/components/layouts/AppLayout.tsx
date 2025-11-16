"use client";
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Users, Calendar, TrendingUp, User, CreditCard, Zap, Activity } from 'lucide-react';
import ChatWidget from '@/components/shared/ChatWidget';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AppLayoutProps {
  children?: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Show loading spinner when navigating between routes
  useEffect(() => {
    // Show loading briefly when pathname changes
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/dashboard' },
    { icon: Zap, label: t('nav.today'), path: '/workouts/today' },
    { icon: Dumbbell, label: t('nav.workouts'), path: '/workouts' },
    { icon: Users, label: t('nav.social'), path: '/social' },
    { icon: Calendar, label: t('nav.calendar'), path: '/calendar' },
    { icon: TrendingUp, label: t('nav.progress'), path: '/progress' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
    { icon: CreditCard, label: t('nav.plans'), path: '/plans' },
  ];

  // Helper function to check if a nav item is active, prioritizing more specific routes
  const isNavItemActive = (itemPath: string) => {
    // Exact match
    if (pathname === itemPath) return true;
    
    // Check if pathname starts with item path (for subroutes)
    if (!pathname.startsWith(itemPath)) return false;
    
    // If it's a subroute match, check if there's a more specific route that also matches
    // If so, this item should not be active (prioritize more specific routes)
    const hasMoreSpecificRoute = navItems.some(otherItem => {
      if (otherItem.path === itemPath) return false;
      // Check if otherItem is more specific (starts with itemPath + '/')
      if (otherItem.path.startsWith(itemPath + '/')) {
        // Check if pathname also matches the more specific route
        return pathname === otherItem.path || pathname.startsWith(otherItem.path + '/');
      }
      return false;
    });
    
    return !hasMoreSpecificRoute;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 gradient-mesh">
      {/* Top Navigation */}
      <nav className="glass-card border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-emerald-500" />
              <span className="text-slate-900 dark:text-white">GymPal</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40 pointer-events-none">
            <LoadingSpinner size="lg" variant="dumbbell" />
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[navItems[0], navItems[2], navItems[3], navItems[5], navItems[7]].filter(Boolean).map((item: any) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
