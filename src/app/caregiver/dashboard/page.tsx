'use client';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, Users, Pill, TrendingUp, Bell } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, todayProgress, medTypeIcons, formatTime, getGreeting } from '@/lib/utils';

export default function CaregiverDashboard() {
  const { state, getMedication } = useStore();
  const user = state.currentUser;
  const today = format(new Date(), 'yyyy-MM-dd');

  // Build per-family-member stats
  const memberStats = useMemo(() => {
    return state.familyMembers
      .filter(fm => fm.caregiverId === user?.id)
      .map(fm => {
        const member = fm.user;
        const doses = state.doseRecords.filter(r =>
          r.userId === member.id && r.scheduledTime.startsWith(today)
        );
        const prog = todayProgress(doses);
        const urgent = doses.filter(r => r.status === 'missed').length;
        const pending = doses.filter(r => r.status === 'pending' || r.status === 'late').length;
        const meds = state.medications.filter(m => m.userId === member.id && m.isActive);
        const lowRefill = meds.filter(m => (m.refillsRemaining ?? 99) <= 2);
        return { member, doses, prog, urgent, pending, meds, lowRefill };
      });
  }, [state.familyMembers, state.doseRecords, state.medications, user, today]);

  // Global alerts
  const allAlerts = memberStats.flatMap(ms => [
    ...ms.doses.filter(d => d.status === 'missed').map(d => ({
      type: 'missed' as const,
      member: ms.member.name,
      med: getMedication(d.medicationId),
      dose: d,
    })),
    ...ms.lowRefill.map(m => ({
      type: 'refill' as const,
      member: ms.member.name,
      med: m,
      dose: null,
    })),
  ]);

  const unreadNotifs = state.notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting(user.name)}</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="relative">
          <button className="p-3 rounded-2xl bg-white shadow-card border border-border hover:bg-gray-50">
            <Bell size={20} className="text-gray-600" />
          </button>
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </div>
      </div>

      {/* Overview tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile
          icon={<Users size={22} className="text-primary-600" />}
          bg="bg-primary-50"
          value={memberStats.length}
          label="Family Members"
        />
        <MetricTile
          icon={<Pill size={22} className="text-teal-600" />}
          bg="bg-teal-50"
          value={memberStats.reduce((s, ms) => s + ms.meds.length, 0)}
          label="Total Medications"
        />
        <MetricTile
          icon={<AlertTriangle size={22} className="text-danger-600" />}
          bg="bg-danger-50"
          value={allAlerts.filter(a => a.type === 'missed').length}
          label="Missed Today"
        />
        <MetricTile
          icon={<TrendingUp size={22} className="text-success-600" />}
          bg="bg-success-50"
          value={
            memberStats.length > 0
              ? Math.round(memberStats.reduce((s, ms) => s + ms.prog.pct, 0) / memberStats.length)
              : 0
          }
          label="Avg. Adherence"
          suffix="%"
        />
      </div>

      {/* Alerts */}
      {allAlerts.length > 0 && (
        <section>
          <h2 className="section-title flex items-center gap-2">
            <AlertTriangle size={20} className="text-danger-500" />
            Alerts ({allAlerts.length})
          </h2>
          <div className="space-y-2">
            {allAlerts.slice(0, 4).map((alert, i) => (
              <div
                key={i}
                className={cn(
                  'card flex gap-3 items-center border-l-4',
                  alert.type === 'missed' ? 'border-l-danger-500 bg-danger-50' : 'border-l-warning-500 bg-warning-50'
                )}
              >
                {alert.type === 'missed'
                  ? <AlertTriangle size={20} className="text-danger-500 shrink-0" />
                  : <Clock size={20} className="text-warning-500 shrink-0" />
                }
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {alert.member}
                    {alert.type === 'missed' && ` missed ${alert.med?.name}`}
                    {alert.type === 'refill' && ` — ${alert.med?.name} refill needed`}
                  </p>
                  {alert.dose && (
                    <p className="text-xs text-gray-500">
                      Scheduled at {formatTime(alert.dose.scheduledTime.slice(11, 16))}
                    </p>
                  )}
                  {alert.type === 'refill' && (
                    <p className="text-xs text-gray-500">
                      {(alert.med as typeof state.medications[0]).refillsRemaining ?? 0} refill{((alert.med as typeof state.medications[0]).refillsRemaining ?? 0) !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
                <StatusBadge status={alert.type === 'missed' ? 'missed' : 'pending'} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Family members overview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Family Members</h2>
          <Link href="/caregiver/family" className="text-sm text-primary-600 font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberStats.map(({ member, prog, urgent, pending, meds }) => (
            <Link href="/caregiver/family" key={member.id}>
              <div className="card hover:shadow-card-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{meds.length} active medication{meds.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{prog.pct}%</p>
                    <p className="text-xs text-gray-500">today</p>
                  </div>
                </div>

                <Progress
                  value={prog.pct}
                  color={prog.pct === 100 ? 'success' : prog.missed > 0 ? 'danger' : 'primary'}
                  size="sm"
                />

                <div className="flex gap-3 mt-3">
                  <Chip count={prog.taken}  color="text-success-600" label="taken" />
                  <Chip count={pending}     color="text-warning-600" label="pending" />
                  <Chip count={urgent}      color="text-danger-600"  label="missed" />
                  <Chip count={prog.total - prog.taken - pending - urgent} color="text-primary-500" label="upcoming" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's upcoming doses */}
      <section>
        <h2 className="section-title">All Upcoming Today</h2>
        <div className="space-y-2">
          {state.doseRecords
            .filter(r =>
              state.familyMembers.some(fm => fm.caregiverId === user.id && fm.userId === r.userId) &&
              r.scheduledTime.startsWith(today) &&
              r.status === 'upcoming'
            )
            .slice(0, 8)
            .map(dose => {
              const med = getMedication(dose.medicationId);
              const member = state.familyMembers.find(fm => fm.userId === dose.userId)?.user;
              if (!med || !member) return null;
              return (
                <div key={dose.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                    {medTypeIcons[med.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{med.name} {med.strength}</p>
                    <p className="text-sm text-gray-500">{member.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-primary-600 text-sm">{formatTime(dose.scheduledTime.slice(11, 16))}</p>
                    <StatusBadge status={dose.status} />
                  </div>
                </div>
              );
            })
          }
        </div>
      </section>
    </div>
  );
}

function MetricTile({ icon, bg, value, label, suffix = '' }: {
  icon: React.ReactNode; bg: string; value: number; label: string; suffix?: string;
}) {
  return (
    <div className="card">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value}{suffix}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Chip({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={cn('text-base font-bold', color)}>{count}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
