'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { CaregiverSidebar, CaregiverBottomNav } from '@/components/caregiver/CaregiverNav';
import { ToastProvider } from '@/components/ui/Toast';

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) router.replace('/login');
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface">
        <CaregiverSidebar />
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            {children}
          </div>
        </main>
        <CaregiverBottomNav />
      </div>
    </ToastProvider>
  );
}
