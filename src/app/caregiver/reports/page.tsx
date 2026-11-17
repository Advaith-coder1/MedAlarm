'use client';
import { useState, useMemo } from 'react';
import { format, subDays, parseISO, startOfWeek, addDays } from 'date-fns';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import type { DoseStatus } from '@/types';

type Period = '7d' | '30d' | '90d';

export default function CaregiverReports() {
  const { state, getMedication } = useStore();
  const user = state.currentUser;
  const [period, setPeriod] = useState<Period>('7d');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const memberIds = state.familyMembers
    .filter(fm => fm.caregiverId === user?.id)
    .map(fm => fm.userId);
  const memberList = state.familyMembers.filter(fm => fm.caregiverId === user?.id);

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

  const dateRange = useMemo(() =>
    Array.from({ length: days }, (_, i) => format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd')),
    [days]
  );

  const relevantDoses = useMemo(() =>
    state.doseRecords.filter(r =>
      memberIds.includes(r.userId) &&
      (selectedMember === 'all' || r.userId === selectedMember) &&
      dateRange.some(d => r.scheduledTime.startsWith(d)) &&
      r.status !== 'upcoming'
    ),
    [state.doseRecords, memberIds, selectedMember, dateRange]
  );

  const stats = useMemo(() => {
    const total  = relevantDoses.length;
    const taken  = relevantDoses.filter(r => r.status === 'taken').length;
    const missed = relevantDoses.filter(r => r.status === 'missed').length;
    const skipped = relevantDoses.filter(r => r.status === 'skipped').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { total, taken, missed, skipped, adherence };
  }, [relevantDoses]);

  // Per-medication stats
  const perMed = useMemo(() => {
    const map: Record<string, { taken: number; missed: number; total: number }> = {};
    relevantDoses.forEach(r => {
      if (!map[r.medicationId]) map[r.medicationId] = { taken: 0, missed: 0, total: 0 };
      map[r.medicationId].total++;
      if (r.status === 'taken')  map[r.medicationId].taken++;
      if (r.status === 'missed') map[r.medicationId].missed++;
    });
    return Object.entries(map)
      .map(([id, s]) => ({ id, ...s, pct: Math.round((s.taken / s.total) * 100) }))
      .sort((a, b) => a.pct - b.pct);
  }, [relevantDoses]);

  // Weekly breakdown (for 7d / 30d)
  const weeklyData = useMemo(() => {
    if (period === '90d') return [];
    return dateRange.map(d => {
      const dayDoses = relevantDoses.filter(r => r.scheduledTime.startsWith(d));
      const taken = dayDoses.filter(r => r.status === 'taken').length;
      const total = dayDoses.length;
      const pct = total > 0 ? Math.round((taken / total) * 100) : null;
      return { date: d, taken, total, pct };
    });
  }, [relevantDoses, dateRange, period]);

  const getMemberName = (uid: string) =>
    state.familyMembers.find(fm => fm.userId === uid)?.user.name ?? '';

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm">Medication adherence analytics</p>
        </div>
        <button className="btn-outline btn-md flex gap-2">
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
                period === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
        <select
          className="input w-auto text-sm"
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
        >
          <option value="all">All Members</option>
          {memberList.map(fm => (
            <option key={fm.userId} value={fm.userId}>{fm.user.name}</option>
          ))}
        </select>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value={`${stats.adherence}%`} label="Adherence" color="text-primary-600" />
        <StatCard value={stats.taken} label="Doses Taken" color="text-success-600" />
        <StatCard value={stats.missed} label="Doses Missed" color="text-danger-600" />
        <StatCard value={stats.skipped} label="Skipped" color="text-gray-500" />
      </div>

      {/* Adherence progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-800">Overall Adherence</p>
          <div className="flex items-center gap-2">
            {stats.adherence >= 80
              ? <TrendingUp size={18} className="text-success-600" />
              : stats.adherence >= 60
                ? <Minus size={18} className="text-warning-600" />
                : <TrendingDown size={18} className="text-danger-600" />
            }
            <span className={cn(
              'font-bold text-lg',
              stats.adherence >= 80 ? 'text-success-600' : stats.adherence >= 60 ? 'text-warning-600' : 'text-danger-600'
            )}>
              {stats.adherence}%
            </span>
          </div>
        </div>
        <Progress
          value={stats.adherence}
          color={stats.adherence >= 80 ? 'success' : stats.adherence >= 60 ? 'warning' : 'danger'}
          size="lg"
        />
        <p className="text-sm text-gray-500 mt-2">
          {stats.taken} of {stats.total} scheduled doses taken over the past {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}.
        </p>
      </div>

      {/* Daily bar chart (simplified) */}
      {weeklyData.length > 0 && (
        <div className="card">
          <p className="font-semibold text-gray-800 mb-4">Daily Adherence</p>
          <div className="flex items-end gap-1.5 h-24">
            {weeklyData.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all',
                    d.pct === null ? 'bg-gray-100'
                    : d.pct === 100 ? 'bg-success-500'
                    : d.pct >= 50 ? 'bg-warning-400'
                    : 'bg-danger-400'
                  )}
                  style={{ height: d.pct !== null ? `${Math.max(8, d.pct)}%` : '8%' }}
                  title={d.pct !== null ? `${d.pct}%` : 'No data'}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{format(parseISO(dateRange[0]), 'MMM d')}</span>
            <span className="text-xs text-gray-400">{format(parseISO(dateRange[dateRange.length - 1]), 'MMM d')}</span>
          </div>
        </div>
      )}

      {/* Per-medication breakdown */}
      <div className="card">
        <p className="font-semibold text-gray-800 mb-4">By Medication</p>
        <div className="space-y-4">
          {perMed.map(({ id, taken, missed, total, pct }) => {
            const med = getMedication(id);
            if (!med) return null;
            return (
              <div key={id}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{med.name} {med.strength}</p>
                    {selectedMember === 'all' && (
                      <p className="text-xs text-gray-400">{getMemberName(med.userId)}</p>
                    )}
                  </div>
                  <span className={cn(
                    'font-bold',
                    pct >= 80 ? 'text-success-600' : pct >= 60 ? 'text-warning-600' : 'text-danger-600'
                  )}>
                    {pct}%
                  </span>
                </div>
                <Progress
                  value={pct}
                  color={pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger'}
                  size="sm"
                />
                <p className="text-xs text-gray-400 mt-1">{taken} taken · {missed} missed · {total} total</p>
              </div>
            );
          })}
          {perMed.length === 0 && (
            <p className="text-center text-gray-400 py-4">No data available for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="card text-center">
      <p className={cn('text-3xl font-bold', color)}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
