'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function RootPage() {
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) {
      router.replace('/login');
    } else if (state.currentUser.role === 'senior') {
      router.replace('/senior/home');
    } else {
      router.replace('/caregiver/dashboard');
    }
  }, [state.currentUser, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-card-lg">
          <span className="text-3xl">💊</span>
        </div>
        <p className="text-gray-500 text-sm animate-pulse-soft">Loading MedAlarm…</p>
      </div>
    </div>
  );
}
