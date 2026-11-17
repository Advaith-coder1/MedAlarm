import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'taken' | 'missed' | 'skipped' | 'pending' | 'upcoming' | 'late' | 'default' | 'info';
  className?: string;
}

const variants: Record<string, string> = {
  taken:    'bg-success-50 text-success-700 border border-success-200',
  missed:   'bg-danger-50 text-danger-600 border border-danger-200',
  skipped:  'bg-gray-100 text-gray-500 border border-gray-200',
  pending:  'bg-warning-50 text-warning-600 border border-warning-200',
  upcoming: 'bg-primary-50 text-primary-600 border border-primary-200',
  late:     'bg-danger-50 text-danger-600 border border-danger-200',
  default:  'bg-gray-100 text-gray-700 border border-gray-200',
  info:     'bg-teal-50 text-teal-700 border border-teal-200',
};

const labels: Record<string, string> = {
  taken: 'Taken', missed: 'Missed', skipped: 'Skipped',
  pending: 'Due Now', upcoming: 'Upcoming', late: 'Late',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const v = status as keyof typeof variants;
  return (
    <span className={cn('badge', variants[v] ?? variants.default)}>
      {labels[status] ?? status}
    </span>
  );
}
