'use client';
import { useState } from 'react';
import { Plus, Search, ChevronRight, Pill, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatTime, foodInstructionLabels, medTypeIcons } from '@/lib/utils';
import type { Medication } from '@/types';

export default function CaregiverMedications() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selected, setSelected] = useState<Medication | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const memberIds = state.familyMembers
    .filter(fm => fm.caregiverId === state.currentUser?.id)
    .map(fm => fm.user.id);

  const memberList = state.familyMembers.filter(fm => fm.caregiverId === state.currentUser?.id);

  const meds = state.medications.filter(m =>
    memberIds.includes(m.userId) &&
    m.isActive &&
    (selectedMember === 'all' || m.userId === selectedMember) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.purpose.toLowerCase().includes(search.toLowerCase()))
  );

  const getMemberName = (uid: string) =>
    state.familyMembers.find(fm => fm.userId === uid)?.user.name ?? 'Unknown';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm">{meds.length} active prescription{meds.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-md flex gap-2">
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 text-sm"
            placeholder="Search medications…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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

      {/* Medications table / cards */}
      <div className="space-y-3">
        {meds.map(med => (
          <div
            key={med.id}
            className="card flex items-center gap-4 hover:shadow-card-lg transition-shadow cursor-pointer"
            onClick={() => setSelected(med)}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-2xl shrink-0">
              {medTypeIcons[med.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{med.name}</p>
                <span className="text-xs text-gray-400">{med.strength}</span>
                {(med.refillsRemaining ?? 99) <= 2 && (
                  <span className="badge bg-danger-50 text-danger-600 border border-danger-200 text-xs flex items-center gap-1">
                    <AlertTriangle size={10} /> Low Refills
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{getMemberName(med.userId)} · {med.purpose}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {med.schedule.times.map(t => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {formatTime(t)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex gap-1">
                <button
                  onClick={e => { e.stopPropagation(); }}
                  className="btn-ghost p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Edit"
                >
                  <Pencil size={16} className="text-gray-500" />
                </button>
              </div>
              <span className={cn(
                'badge text-xs',
                med.isPaused ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-success-50 text-success-700 border border-success-200'
              )}>
                {med.isPaused ? 'Paused' : 'Active'}
              </span>
            </div>
          </div>
        ))}
        {meds.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Pill size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-600">No medications found</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.name} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Patient', getMemberName(selected.userId)],
                ['Strength', selected.strength],
                ['Dosage', selected.dosage],
                ['Type', selected.type],
                ['Purpose', selected.purpose],
                ['Food', foodInstructionLabels[selected.foodInstruction]],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3 border border-border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{k}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 capitalize">{v}</p>
                </div>
              ))}
            </div>
            <div className="card bg-primary-50 border-primary-100">
              <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 mb-2">Schedule</p>
              <p className="font-medium text-gray-800 capitalize mb-2">{selected.schedule.frequency.replace('_', ' ')}</p>
              <div className="flex flex-wrap gap-2">
                {selected.schedule.times.map(t => (
                  <span key={t} className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {formatTime(t)}
                  </span>
                ))}
              </div>
            </div>
            {selected.avoidFoods && selected.avoidFoods.length > 0 && (
              <div className="card bg-danger-50 border-danger-200">
                <p className="font-semibold text-danger-700 flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} /> Avoid
                </p>
                {selected.avoidFoods.map(f => (
                  <p key={f} className="text-sm text-danger-700">• {f}</p>
                ))}
              </div>
            )}
            {selected.notes && (
              <div className="card bg-warning-50 border-warning-200">
                <p className="text-warning-700 text-sm"><strong>Note:</strong> {selected.notes}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button className="flex-1 btn-outline btn-md flex gap-2">
                <Pencil size={16} /> Edit
              </button>
              <button className="flex-1 btn-danger btn-md flex gap-2">
                <Trash2 size={16} /> Deactivate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Medication" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Patient</label>
            <select className="input">
              {memberList.map(fm => (
                <option key={fm.userId} value={fm.userId}>{fm.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Medication name</label>
            <input type="text" className="input" placeholder="e.g. Lisinopril" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Strength</label>
              <input type="text" className="input" placeholder="e.g. 10mg" />
            </div>
            <div>
              <label className="label">Dosage</label>
              <input type="text" className="input" placeholder="e.g. 1 tablet" />
            </div>
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea className="input" rows={3} placeholder="Take by mouth once daily with water…" />
          </div>
          <div>
            <label className="label">Food instruction</label>
            <select className="input">
              <option value="any_time">Any time</option>
              <option value="with_food">Take with food</option>
              <option value="with_meal">Take with a meal</option>
              <option value="empty_stomach">Take on empty stomach</option>
            </select>
          </div>
          <button className="w-full btn-primary btn-lg">Save Medication</button>
        </div>
      </Modal>
    </div>
  );
}
