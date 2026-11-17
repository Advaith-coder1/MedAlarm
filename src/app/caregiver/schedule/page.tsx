'use client';
import { useState } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatTime, medTypeIcons } from '@/lib/utils';

export default function CaregiverSchedule() {
  const { state, getMedication } = useStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const user = state.currentUser;
  const memberIds = state.familyMembers
    .filter(fm => fm.caregiverId === user?.id)
    .map(fm => fm.userId);
  const memberList = state.familyMembers.filter(fm => fm.caregiverId === user?.id);

  const dateStr = format(viewDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  // Build a week view — 7 days starting from viewDate - 3
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(subDays(viewDate, 3), i));

  const doses = state.doseRecords.filter(r =>
    memberIds.includes(r.userId) &&
    r.scheduledTime.startsWith(dateStr) &&
    (selectedMember === 'all' || r.userId === selectedMember)
  ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  // Group by time
  const timeGroups: Record<string, typeof doses> = {};
  doses.forEach(d => {
    const t = d.scheduledTime.slice(11, 16);
    if (!timeGroups[t]) timeGroups[t] = [];
    timeGroups[t].push(d);
  });

  const getMemberName = (uid: string) =>
    state.familyMembers.find(fm => fm.userId === uid)?.user.name ?? '';

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
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

      {/* Week row */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setViewDate(d => subDays(d, 7))} className="btn-ghost p-2 rounded-xl">
            <ChevronLeft size={20} />
          </button>
          <p className="font-semibold text-gray-800">{format(viewDate, 'MMMM yyyy')}</p>
          <button onClick={() => setViewDate(d => addDays(d, 7))} className="btn-ghost p-2 rounded-xl">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => {
            const dStr = format(d, 'yyyy-MM-dd');
            const isSelected = dStr === dateStr;
            const isCurrentDay = dStr === format(new Date(), 'yyyy-MM-dd');
            const dayDoses = state.doseRecords.filter(r => memberIds.includes(r.userId) && r.scheduledTime.startsWith(dStr));
            const hasMissed = dayDoses.some(r => r.status === 'missed');
            const allTaken  = dayDoses.length > 0 && dayDoses.every(r => r.status === 'taken' || r.status === 'upcoming' || r.status === 'skipped');
            return (
              <button
                key={dStr}
                onClick={() => setViewDate(d)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  isSelected ? 'bg-primary-600 text-white' : isCurrentDay ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'
                )}
              >
                <span className="text-xs font-medium">{format(d, 'EEE')}</span>
                <span className="text-base font-bold">{format(d, 'd')}</span>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isSelected ? 'bg-white/60'
                  : hasMissed ? 'bg-danger-500'
                  : allTaken ? 'bg-success-500'
                  : dayDoses.length > 0 ? 'bg-warning-400'
                  : 'bg-transparent'
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day */}
      <div>
        <h2 className="section-title">
          {isToday ? "Today's Schedule" : format(viewDate, 'EEEE, MMMM d')}
        </h2>

        {Object.keys(timeGroups).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold text-gray-600">No doses scheduled</p>
            <p className="text-sm mt-1">for this date</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(timeGroups).map(([time, timeDoses]) => (
              <div key={time}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary-100 text-primary-700 font-bold text-sm px-3 py-1 rounded-full">
                    {formatTime(time)}
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2 ml-4">
                  {timeDoses.map(dose => {
                    const med = getMedication(dose.medicationId);
                    if (!med) return null;
                    return (
                      <div key={dose.id} className="card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                          {medTypeIcons[med.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{med.name} {med.strength}</p>
                          <p className="text-sm text-gray-500">{getMemberName(dose.userId)} · {med.dosage}</p>
                        </div>
                        <StatusBadge status={dose.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
