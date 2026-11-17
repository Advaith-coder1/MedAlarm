'use client';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Bell, ChevronRight, CheckCircle, AlertCircle, Clock, Utensils, Pill } from 'lucide-react';
import { useStore } from '@/lib/store';
import { MedicationWorkflow } from '@/components/senior/MedicationWorkflow';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, getGreeting, todayProgress, formatTime, foodInstructionLabels, medTypeIcons, statusColors } from '@/lib/utils';

export default function SeniorHome() {
  const { state, getTodayDoses, getMedication } = useStore();
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const user = state.currentUser;
  const today = new Date();

  const doses = getTodayDoses(user?.id ?? '');
  const progress = todayProgress(doses);
  const pendingDoses = doses.filter(d => d.status === 'pending' || d.status === 'late');
  const upcomingDoses = doses.filter(d => d.status === 'upcoming').slice(0, 3);

  const nextPendingMed = useMemo(() => {
    const d = pendingDoses[0];
    return d ? getMedication(d.medicationId) : undefined;
  }, [pendingDoses, getMedication]);

  const notifications = state.notifications.filter(n => !n.isRead && n.userId === user?.id);

  const foodMeds = pendingDoses
    .map(d => getMedication(d.medicationId))
    .filter(m => m && ['with_food', 'with_meal', 'after_meal', 'empty_stomach'].includes(m.foodInstruction));

  if (!user) return null;

  return (
    <>
      {/* Page */}
      <div className="space-y-5 animate-fade-in">
        {/* Greeting + date */}
        <header>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getGreeting(user.name)}</h1>
              <p className="text-gray-500 mt-0.5">{format(today, 'EEEE, MMMM d')}</p>
            </div>
            <div className="relative">
              <button className="p-3 rounded-2xl bg-white shadow-card border border-border hover:bg-gray-50">
                <Bell size={22} className="text-gray-600" />
              </button>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Progress summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">Today&apos;s Progress</p>
            <span className="text-2xl font-bold text-primary-600">{progress.pct}%</span>
          </div>
          <Progress value={progress.pct} color={progress.pct === 100 ? 'success' : 'primary'} size="md" />
          <div className="flex gap-4 mt-3">
            <StatChip icon="✅" count={progress.taken} label="Taken" color="text-success-600" />
            <StatChip icon="⏳" count={progress.pending} label="Pending" color="text-warning-600" />
            <StatChip icon="❌" count={progress.missed} label="Missed" color="text-danger-600" />
            <StatChip
              icon="📋"
              count={progress.total - progress.taken - progress.pending - progress.missed}
              label="Remaining"
              color="text-gray-500"
            />
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(0, 2).map(n => (
              <div
                key={n.id}
                className={cn(
                  'card flex gap-3 items-start border-l-4',
                  n.type === 'missed'  && 'border-l-danger-500 bg-danger-50',
                  n.type === 'refill'  && 'border-l-warning-500 bg-warning-50',
                  n.type === 'reminder' && 'border-l-primary-500 bg-primary-50',
                )}
              >
                {n.type === 'missed'   && <AlertCircle size={20} className="text-danger-500 shrink-0 mt-0.5" />}
                {n.type === 'refill'   && <AlertCircle size={20} className="text-warning-500 shrink-0 mt-0.5" />}
                {n.type === 'reminder' && <Bell        size={20} className="text-primary-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-600 text-sm">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Food instructions */}
        {foodMeds.length > 0 && (
          <div className="card border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3 mb-2">
              <Utensils size={20} className="text-orange-500" />
              <p className="font-semibold text-orange-800">Food reminders for today</p>
            </div>
            {foodMeds.map(m => m && (
              <p key={m.id} className="text-sm text-orange-700 ml-8">
                • <strong>{m.name}</strong>: {foodInstructionLabels[m.foodInstruction]}
              </p>
            ))}
          </div>
        )}

        {/* Next medication CTA */}
        {pendingDoses.length > 0 && nextPendingMed ? (
          <div className="card-lg bg-gradient-to-br from-primary-600 to-primary-700 text-white border-primary-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-primary-200 text-sm font-medium uppercase tracking-wide">Due Now</p>
                <h2 className="text-2xl font-bold mt-1">{nextPendingMed.name}</h2>
                <p className="text-primary-200">{nextPendingMed.strength} · {nextPendingMed.dosage}</p>
              </div>
              <div className="bg-white/20 rounded-2xl w-16 h-16 flex items-center justify-center text-3xl">
                {medTypeIcons[nextPendingMed.type]}
              </div>
            </div>
            {pendingDoses.length > 1 && (
              <p className="text-primary-200 text-sm mb-4">
                + {pendingDoses.length - 1} more medication{pendingDoses.length > 2 ? 's' : ''}
              </p>
            )}
            <button
              onClick={() => setWorkflowOpen(true)}
              className="w-full bg-white text-primary-700 font-bold py-4 px-6 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-button hover:bg-primary-50 transition-colors active:scale-[.98]"
            >
              <Pill size={24} />
              START MY MEDICATIONS
            </button>
          </div>
        ) : progress.total > 0 && progress.taken === progress.total ? (
          <div className="card-lg bg-gradient-to-br from-success-600 to-success-700 text-white border-success-700">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-2xl p-3">
                <CheckCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">All done today!</h2>
                <p className="text-success-100">You&apos;ve taken all {progress.total} medications.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-4xl mb-3">🌙</p>
            <p className="font-semibold text-gray-700 text-xl">No medications due right now</p>
            <p className="text-gray-500 mt-1">Check back later for your next scheduled dose.</p>
          </div>
        )}

        {/* Upcoming medications */}
        {upcomingDoses.length > 0 && (
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Clock size={20} />
              Coming up today
            </h2>
            <div className="space-y-2">
              {upcomingDoses.map(d => {
                const med = getMedication(d.medicationId);
                if (!med) return null;
                return (
                  <div key={d.id} className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                      {medTypeIcons[med.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.strength} · {med.dosage}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-primary-600">{formatTime(d.scheduledTime.slice(11, 16))}</p>
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's full schedule */}
        <div>
          <h2 className="section-title">Today&apos;s full schedule</h2>
          <div className="space-y-2">
            {doses.map(d => {
              const med = getMedication(d.medicationId);
              if (!med) return null;
              const sc = statusColors[d.status];
              return (
                <div key={d.id} className={cn('card flex items-center gap-4 border-l-4', sc.border)}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0', sc.bg)}>
                    {medTypeIcons[med.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{med.name} {med.strength}</p>
                    <p className="text-sm text-gray-500">{formatTime(d.scheduledTime.slice(11, 16))}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workflow overlay */}
      {workflowOpen && (
        <MedicationWorkflow
          doses={doses}
          onComplete={() => setWorkflowOpen(false)}
          onClose={() => setWorkflowOpen(false)}
        />
      )}
    </>
  );
}

function StatChip({ icon, count, label, color }: { icon: string; count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base">{icon}</span>
      <span className={cn('text-lg font-bold', color)}>{count}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
