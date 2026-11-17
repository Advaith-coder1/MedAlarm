'use client';
import { useState } from 'react';
import { Plus, Search, ChevronRight, Pill, Camera, FileText, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatTime, foodInstructionLabels, medTypeIcons } from '@/lib/utils';
import type { Medication } from '@/types';

function MedDetail({ med, onClose }: { med: Medication; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={med.name} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl border border-border">
            {medTypeIcons[med.type]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{med.name}</h2>
            <p className="text-gray-500">{med.genericName}</p>
            {med.brandName && <p className="text-xs text-gray-400">{med.brandName}</p>}
          </div>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Strength" value={med.strength} />
          <InfoCard label="Dosage" value={med.dosage} />
          <InfoCard label="Purpose" value={med.purpose} />
          <InfoCard label="Type" value={med.type} />
        </div>

        {/* Schedule */}
        <div className="card bg-primary-50 border-primary-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-primary-700 mb-2">Schedule</p>
          <p className="font-medium text-gray-800 capitalize">{med.schedule.frequency.replace('_', ' ')}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {med.schedule.times.map(t => (
              <span key={t} className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                {formatTime(t)}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <Row icon="📋" label="Instructions" value={med.instructions} />
          <Row icon="🍽️" label="Food" value={foodInstructionLabels[med.foodInstruction]} />
          {med.waterInstruction && <Row icon="💧" label="Water" value={med.waterInstruction} />}
        </div>

        {/* Avoid */}
        {med.avoidFoods && med.avoidFoods.length > 0 && (
          <div className="card bg-danger-50 border-danger-200">
            <p className="text-danger-700 font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle size={16} /> Do not take with:
            </p>
            {med.avoidFoods.map(f => (
              <p key={f} className="text-sm text-danger-700">• {f}</p>
            ))}
          </div>
        )}

        {/* Pharmacy */}
        {(med.prescribedBy || med.pharmacy) && (
          <div className="card bg-gray-50 space-y-2">
            {med.prescribedBy && <Row icon="👨‍⚕️" label="Doctor" value={med.prescribedBy} />}
            {med.pharmacy && <Row icon="🏥" label="Pharmacy" value={med.pharmacy} />}
            {med.refillsRemaining !== undefined && (
              <Row
                icon="🔄"
                label="Refills remaining"
                value={`${med.refillsRemaining} refill${med.refillsRemaining !== 1 ? 's' : ''}`}
              />
            )}
          </div>
        )}

        {med.notes && (
          <div className="card bg-warning-50 border-warning-200">
            <p className="text-warning-700 text-sm"><strong>Note:</strong> {med.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-border">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="font-semibold text-gray-900 mt-0.5 capitalize">{value}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function SeniorMedications() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Medication | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const meds = state.medications.filter(m =>
    m.userId === state.currentUser?.id && m.isActive &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.purpose.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm flex gap-2 rounded-xl">
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input pl-11"
          placeholder="Search medications…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">{meds.length} active medication{meds.length !== 1 ? 's' : ''}</p>

      {/* List */}
      <div className="space-y-3">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => setSelected(med)}
            className="w-full card text-left hover:shadow-card-lg transition-shadow active:scale-[.99] flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-3xl shrink-0">
              {medTypeIcons[med.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-lg">{med.name}</p>
                {med.refillsRemaining !== undefined && med.refillsRemaining <= 2 && (
                  <span className="badge bg-danger-50 text-danger-600 border border-danger-200 text-xs">Low Refills</span>
                )}
              </div>
              <p className="text-gray-500">{med.strength} · {med.dosage}</p>
              <p className="text-sm text-teal-600 font-medium mt-0.5">{med.purpose}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {med.schedule.times.map(t => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                    {formatTime(t)}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Detail modal */}
      {selected && <MedDetail med={selected} onClose={() => setSelected(null)} />}

      {/* Add medication modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Medication" size="lg">
        <div className="space-y-4">
          <p className="text-gray-600">How would you like to add your medication?</p>
          <div className="grid grid-cols-1 gap-3">
            <AddOption
              icon={<Pill size={28} className="text-primary-600" />}
              title="Enter manually"
              desc="Type the medication details yourself"
              onClick={() => setShowAdd(false)}
            />
            <AddOption
              icon={<Camera size={28} className="text-teal-600" />}
              title="Photograph prescription bottle"
              desc="We'll read the label automatically"
              onClick={() => setShowAdd(false)}
            />
            <AddOption
              icon={<FileText size={28} className="text-orange-500" />}
              title="Upload a document"
              desc="Prescription PDF or medication list"
              onClick={() => setShowAdd(false)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AddOption({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full border-2 border-border hover:border-primary-300 hover:bg-primary-50 rounded-2xl p-4 text-left transition-all flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <ChevronRight size={18} className="text-gray-400 ml-auto shrink-0" />
    </button>
  );
}
