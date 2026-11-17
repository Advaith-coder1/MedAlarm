import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import type { DoseStatus, FoodInstruction, MedType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, 'h:mm a');
}

export function formatDateTime(isoStr: string): string {
  const d = parseISO(isoStr);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy \'at\' h:mm a');
}

export function formatDate(isoStr: string): string {
  const d = parseISO(isoStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMMM d, yyyy');
}

export const statusColors: Record<DoseStatus, { bg: string; text: string; border: string; label: string }> = {
  taken:    { bg: 'bg-success-50',  text: 'text-success-700', border: 'border-success-500', label: 'Taken' },
  missed:   { bg: 'bg-danger-50',   text: 'text-danger-600',  border: 'border-danger-500',  label: 'Missed' },
  skipped:  { bg: 'bg-gray-100',    text: 'text-gray-500',    border: 'border-gray-300',    label: 'Skipped' },
  pending:  { bg: 'bg-warning-50',  text: 'text-warning-600', border: 'border-warning-500', label: 'Due Now' },
  upcoming: { bg: 'bg-primary-50',  text: 'text-primary-600', border: 'border-primary-500', label: 'Upcoming' },
  late:     { bg: 'bg-danger-50',   text: 'text-danger-600',  border: 'border-danger-500',  label: 'Late' },
};

export const foodInstructionLabels: Record<FoodInstruction, string> = {
  with_food:     'Take with food',
  with_meal:     'Take with a meal',
  before_food:   'Take before food',
  empty_stomach: 'Take on an empty stomach',
  after_meal:    'Take after a meal',
  any_time:      'Take any time',
};

export const medTypeIcons: Record<MedType, string> = {
  tablet:    '💊',
  capsule:   '💊',
  liquid:    '🧪',
  injection: '💉',
  inhaler:   '🫁',
  patch:     '🩹',
  other:     '💊',
};

export function getMedColorDot(status: DoseStatus): string {
  const map: Record<DoseStatus, string> = {
    taken: 'bg-success-500',
    missed: 'bg-danger-500',
    skipped: 'bg-gray-400',
    pending: 'bg-warning-500',
    upcoming: 'bg-primary-500',
    late: 'bg-danger-500',
  };
  return map[status];
}

export function getGreeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name.split(' ')[0]}!`;
  if (h < 17) return `Good afternoon, ${name.split(' ')[0]}!`;
  return `Good evening, ${name.split(' ')[0]}!`;
}

export function todayProgress(records: { status: DoseStatus; scheduledTime: string }[]): {
  total: number; taken: number; missed: number; pending: number; pct: number;
} {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecs = records.filter(r => r.scheduledTime.startsWith(today));
  const total   = todayRecs.length;
  const taken   = todayRecs.filter(r => r.status === 'taken').length;
  const missed  = todayRecs.filter(r => r.status === 'missed').length;
  const pending = todayRecs.filter(r => r.status === 'pending' || r.status === 'late').length;
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
  return { total, taken, missed, pending, pct };
}
