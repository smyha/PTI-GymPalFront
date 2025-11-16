import AppLayout from '@/components/layouts/AppLayout';
import ThemeToggle from '@/components/layouts/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>
    {children}
  </AppLayout>;
}


