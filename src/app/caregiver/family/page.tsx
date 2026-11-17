'use client';
import { useState } from 'react';
import { Plus, Phone, Mail, ChevronRight, User } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, todayProgress, medTypeIcons, formatTime } from '@/lib/utils';
import type { FamilyMember } from '@/types';

function MemberDetail({ fm, onClose }: { fm: FamilyMember; onClose: () => void }) {
  const { state, getMedication } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const doses = state.doseRecords.filter(r => r.userId === fm.user.id && r.scheduledTime.startsWith(today));
  const meds  = state.medications.filter(m => m.userId === fm.user.id && m.isActive);
  const prog  = todayProgress(doses);
  const age   = fm.user.dateOfBirth ? differenceInYears(new Date(), parseISO(fm.user.dateOfBirth)) : null;

  return (
    <Modal open onClose={onClose} title={fm.user.name} size="lg">
      <div className="space-y-5">
        {/* Avatar + basics */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {fm.user.name[0]}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{fm.relationship}</p>
            <h2 className="text-2xl font-bold text-gray-900">{fm.user.name}</h2>
            {age !== null && <p className="text-gray-500">Age {age}</p>}
            {fm.user.phone && (
              <a href={`tel:${fm.user.phone}`} className="flex items-center gap-2 text-primary-600 text-sm mt-1 hover:underline">
                <Phone size={14} /> {fm.user.phone}
              </a>
            )}
          </div>
        </div>

        {/* Today's progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-800">Today&apos;s Adherence</p>
            <span className="text-2xl font-bold text-primary-600">{prog.pct}%</span>
          </div>
          <Progress value={prog.pct} color={prog.pct === 100 ? 'success' : prog.missed > 0 ? 'danger' : 'primary'} />
          <div className="flex gap-6 mt-3 text-sm">
            <span className="text-success-600 font-medium">✅ {prog.taken} taken</span>
            <span className="text-warning-600 font-medium">⏳ {prog.pending} pending</span>
            <span className="text-danger-600 font-medium">❌ {prog.missed} missed</span>
          </div>
        </div>

        {/* Medications */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">Medications ({meds.length})</p>
          <div className="space-y-2">
            {meds.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                <span className="text-xl">{medTypeIcons[m.type]}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{m.name} {m.strength}</p>
                  <p className="text-xs text-gray-500">{m.schedule.times.map(formatTime).join(', ')}</p>
                </div>
                {(m.refillsRemaining ?? 99) <= 2 && (
                  <span className="badge bg-danger-50 text-danger-600 border border-danger-200 text-xs">Low Refills</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's doses */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">Today&apos;s Doses</p>
          <div className="space-y-2">
            {doses.map(d => {
              const med = getMedication(d.medicationId);
              return med ? (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                  <span className="text-lg">{medTypeIcons[med.type]}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{med.name}</p>
                    <p className="text-xs text-gray-400">{formatTime(d.scheduledTime.slice(11, 16))}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function CaregiverFamily() {
  const { state } = useStore();
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const members = state.familyMembers.filter(fm => fm.caregiverId === state.currentUser?.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-500 text-sm">{members.length} member{members.length !== 1 ? 's' : ''} connected</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary btn-md flex gap-2">
          <Plus size={18} /> Invite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map(fm => {
          const doses = state.doseRecords.filter(r => r.userId === fm.user.id && r.scheduledTime.startsWith(today));
          const prog  = todayProgress(doses);
          const meds  = state.medications.filter(m => m.userId === fm.user.id && m.isActive).length;
          const age   = fm.user.dateOfBirth ? differenceInYears(new Date(), parseISO(fm.user.dateOfBirth)) : null;

          return (
            <button
              key={fm.id}
              onClick={() => setSelected(fm)}
              className="card-lg text-left hover:shadow-card-lg transition-shadow active:scale-[.99]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {fm.user.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-lg">{fm.user.name}</p>
                    <span className="badge bg-gray-100 text-gray-500 border border-gray-200">{fm.relationship}</span>
                  </div>
                  {age !== null && <p className="text-gray-500 text-sm">Age {age}</p>}
                  <p className="text-sm text-gray-500">{meds} medication{meds !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 shrink-0 mt-1" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Today&apos;s adherence</p>
                <span className="font-bold text-primary-600">{prog.pct}%</span>
              </div>
              <Progress
                value={prog.pct}
                color={prog.pct === 100 ? 'success' : prog.missed > 0 ? 'danger' : 'primary'}
                size="sm"
              />

              {fm.user.phone && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <Phone size={14} />
                  <span>{fm.user.phone}</span>
                </div>
              )}
            </button>
          );
        })}

        {/* Add member placeholder */}
        <button
          onClick={() => setShowInvite(true)}
          className="card-lg flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-border hover:border-primary-300 hover:bg-primary-50 transition-all text-gray-400 hover:text-primary-600"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Plus size={28} />
          </div>
          <div className="text-center">
            <p className="font-semibold">Add Family Member</p>
            <p className="text-sm">Send them an invitation</p>
          </div>
        </button>
      </div>

      {/* Detail modal */}
      {selected && <MemberDetail fm={selected} onClose={() => setSelected(null)} />}

      {/* Invite modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Family Member" size="md">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Send an invitation to a family member or patient. They&apos;ll create a MedAlarm account and connect to you.
          </p>
          <div>
            <label className="label">Their email address</label>
            <input type="email" className="input" placeholder="family@example.com" />
          </div>
          <div>
            <label className="label">Relationship</label>
            <select className="input">
              <option>Parent</option>
              <option>Spouse</option>
              <option>Sibling</option>
              <option>Patient</option>
              <option>Other</option>
            </select>
          </div>
          <button className="w-full btn-primary btn-lg">Send Invitation</button>
        </div>
      </Modal>
    </div>
  );
}
