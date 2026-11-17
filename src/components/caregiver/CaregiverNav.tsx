'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Pill, CalendarDays, Clock,
  FileText, BarChart3, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/caregiver/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/caregiver/family',     icon: Users,            label: 'Family' },
  { href: '/caregiver/medications',icon: Pill,             label: 'Medications' },
  { href: '/caregiver/schedule',   icon: CalendarDays,     label: 'Schedule' },
  { href: '/caregiver/history',    icon: Clock,            label: 'History' },
  { href: '/caregiver/reports',    icon: BarChart3,        label: 'Reports' },
  { href: '/caregiver/settings',   icon: Settings,         label: 'Settings' },
];

export function CaregiverSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-white border-r border-border flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-lg">💊</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">MedAlarm</p>
            <p className="text-xs text-gray-400">Caregiver</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function CaregiverBottomNav() {
  const pathname = usePathname();
  const main = NAV.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border md:hidden">
      <div className="flex">
        {main.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors',
                active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
