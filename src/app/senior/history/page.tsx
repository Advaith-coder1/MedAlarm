'use client';
import { useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { useStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatDateTime, medTypeIcons, getMedColorDot } from '@/lib/utils';
import type { DoseStatus } from '@/types';

export default function SeniorHistory() {
  const { state, getMedication } = useStore();
  const user = state.currentUser;
  const [filterStatus, setFilterStatus] = useState<DoseStatus | 'all'>('all');

  const records = state.doseRecords
    .filter(r => r.userId === user?.id)
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime));

  // Group by date
  const grouped: Record<string, typeof records> = {};
  records.forEach(r => {
    const day = r.scheduledTime.slice(0, 10);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r);
  });

  // Last 7 days summary for the mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const dayRecs = state.doseRecords.filter(r => r.userId === user?.id && r.scheduledTime.startsWith(key));
    const taken  = dayRecs.filter(r => r.status === 'taken').length;
    const total  = dayRecs.filter(r => r.status !== 'upcoming').length;
    const missed = dayRecs.filter(r => r.status === 'missed').length;
    const dot = missed > 0 ? 'bg-danger-500' : taken === total && total > 0 ? 'bg-success-500' : total > 0 ? 'bg-warning-500' : 'bg-gray-200';
    return { date: d, key, taken, total, missed, dot };
  });

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Medication History</h1>

      {/* 7-day mini view */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-3">Last 7 Days</p>
        <div className="flex justify-between">
          {last7.map(d => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{format(d.date, 'EEE')}</span>
              <span className="text-sm font-semibold text-gray-700">{format(d.date, 'd')}</span>
              <span className={cn('w-3 h-3 rounded-full', d.dot)} />
              {d.total > 0 && (
                <span className="text-xs text-gray-500">{d.taken}/{d.total}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-border">
          <Legend dot="bg-success-500" label="All taken" />
          <Legend dot="bg-warning-500" label="Partial" />
          <Legend dot="bg-danger-500" label="Missed" />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(['all', 'taken', 'missed', 'skipped', 'pending'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
              filterStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-border text-gray-600 hover:bg-gray-50'
            )}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-600">No records found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, recs]) => (
          <section key={day}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {day === format(new Date(), 'yyyy-MM-dd')
                ? 'Today'
                : day === format(subDays(new Date(), 1), 'yyyy-MM-dd')
                  ? 'Yesterday'
                  : format(parseISO(day), 'EEEE, MMMM d')
              }
            </h2>
            <div className="space-y-2">
              {recs.map(r => {
                const med = getMedication(r.medicationId);
                if (!med) return null;
                return (
                  <div key={r.id} className="card flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {medTypeIcons[med.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{med.name} {med.strength}</p>
                      <p className="text-sm text-gray-500">{med.dosage}</p>
                      <p className="text-xs text-gray-400">Scheduled: {format(parseISO(r.scheduledTime), 'h:mm a')}</p>
                      {r.takenAt && (
                        <p className="text-xs text-success-600">Taken: {format(parseISO(r.takenAt), 'h:mm a')}</p>
                      )}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-full', dot)} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
