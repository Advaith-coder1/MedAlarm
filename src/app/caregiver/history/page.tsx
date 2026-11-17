'use client';
import { useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { useStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, medTypeIcons } from '@/lib/utils';
import type { DoseStatus } from '@/types';

export default function CaregiverHistory() {
  const { state, getMedication } = useStore();
  const user = state.currentUser;
  const [filterStatus, setFilterStatus] = useState<DoseStatus | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const memberIds = state.familyMembers
    .filter(fm => fm.caregiverId === user?.id)
    .map(fm => fm.userId);
  const memberList = state.familyMembers.filter(fm => fm.caregiverId === user?.id);

  const getMemberName = (uid: string) =>
    state.familyMembers.find(fm => fm.userId === uid)?.user.name ?? '';

  const records = state.doseRecords
    .filter(r =>
      memberIds.includes(r.userId) &&
      (selectedMember === 'all' || r.userId === selectedMember) &&
      (filterStatus === 'all' || r.status === filterStatus)
    )
    .sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime));

  const grouped: Record<string, typeof records> = {};
  records.forEach(r => {
    const day = r.scheduledTime.slice(0, 10);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r);
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Medication History</h1>
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

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
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

      {/* Groups */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-600">No records match</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, recs]) => (
          <section key={day}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {day === today ? 'Today' : day === yesterday ? 'Yesterday' : format(parseISO(day), 'EEEE, MMMM d')}
            </h2>
            <div className="card overflow-hidden p-0 divide-y divide-border">
              {recs.map(r => {
                const med = getMedication(r.medicationId);
                if (!med) return null;
                return (
                  <div key={r.id} className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {medTypeIcons[med.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{med.name} {med.strength}</p>
                      <p className="text-xs text-gray-500">
                        {getMemberName(r.userId)} · {format(parseISO(r.scheduledTime), 'h:mm a')}
                        {r.takenAt && ` → taken ${format(parseISO(r.takenAt), 'h:mm a')}`}
                      </p>
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
