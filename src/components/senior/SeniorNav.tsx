'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Pill, Clock, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV = [
  { href: '/senior/home',        icon: Home,       label: 'Home' },
  { href: '/senior/medications', icon: Pill,        label: 'My Meds' },
  { href: '/senior/history',     icon: Clock,       label: 'History' },
  { href: '/senior/documents',   icon: FileText,    label: 'Documents' },
  { href: '/senior/help',        icon: HelpCircle,  label: 'Help' },
];

export function SeniorNav() {
  const pathname = usePathname();
  const { state } = useStore();
  const pending = state.doseRecords.filter(r =>
    r.userId === state.currentUser?.id &&
    r.scheduledTime.startsWith(new Date().toISOString().slice(0, 10)) &&
    (r.status === 'pending' || r.status === 'late')
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const isHome = href === '/senior/home';
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative',
                active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {isHome && pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pending}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
