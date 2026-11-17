'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { SeniorNav } from '@/components/senior/SeniorNav';
import { ToastProvider } from '@/components/ui/Toast';

export default function SeniorLayout({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) router.replace('/login');
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface pb-20" data-senior-mode="true">
        <main className="max-w-lg mx-auto px-4 py-6">
          {children}
        </main>
        <SeniorNav />
      </div>
    </ToastProvider>
  );
}
