'use client';
import { useState, useCallback } from 'react';
import { CheckCircle, ChevronRight, Camera, Utensils, Droplets, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { cn, formatTime, foodInstructionLabels, medTypeIcons } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { DoseRecord, Medication } from '@/types';

interface WorkflowProps {
  doses: DoseRecord[];
  onComplete: () => void;
  onClose: () => void;
}

type Step = 'intro' | 'food_check' | 'instruction' | 'verify' | 'confirm' | 'next' | 'complete';

function MedPill({ med }: { med: Medication }) {
  const colorBg: Record<string, string> = {
    white: 'bg-gray-100 border-gray-200', orange: 'bg-orange-100 border-orange-200',
    yellow: 'bg-yellow-100 border-yellow-200', blue: 'bg-blue-100 border-blue-200',
    pink: 'bg-pink-100 border-pink-200', green: 'bg-green-100 border-green-200',
  };
  const bg = colorBg[(med.color ?? 'white').toLowerCase()] ?? 'bg-gray-100 border-gray-200';
  return (
    <div className={cn('w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 mx-auto', bg)}>
      <span className="text-4xl">{medTypeIcons[med.type]}</span>
      {med.color && <span className="text-xs font-medium text-gray-600">{med.color} {med.shape}</span>}
    </div>
  );
}

export function MedicationWorkflow({ doses, onComplete, onClose }: WorkflowProps) {
  const { state, recordDose, getMedication } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState<Step>('intro');
  const [mealConfirmed, setMealConfirmed] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const pendingDoses = doses.filter(d => d.status === 'pending' || d.status === 'late');
  const currentDose = pendingDoses[currentIdx];
  const currentMed = currentDose ? getMedication(currentDose.medicationId) : undefined;

  const needsFood = currentMed &&
    ['with_food', 'with_meal', 'after_meal'].includes(currentMed.foodInstruction);

  const advance = useCallback(() => {
    if (step === 'intro') {
      setStep(needsFood ? 'food_check' : 'instruction');
    } else if (step === 'food_check') {
      setMealConfirmed(true);
      setStep('instruction');
    } else if (step === 'instruction') {
      setStep('confirm');
    } else if (step === 'confirm') {
      recordDose(currentDose.id, 'taken');
      if (currentIdx + 1 < pendingDoses.length) {
        setCurrentIdx(i => i + 1);
        setStep('next');
      } else {
        setStep('complete');
      }
    } else if (step === 'next') {
      setMealConfirmed(false);
      const nextMed = getMedication(pendingDoses[currentIdx + 1 - 1]?.medicationId ?? '');
      setStep(!nextMed || !['with_food','with_meal','after_meal'].includes(nextMed?.foodInstruction ?? '') ? 'instruction' : 'food_check');
    }
  }, [step, needsFood, currentDose, currentIdx, pendingDoses, recordDose, getMedication]);

  const skipDose = () => {
    if (currentDose) recordDose(currentDose.id, 'skipped');
    if (currentIdx + 1 < pendingDoses.length) {
      setCurrentIdx(i => i + 1);
      setStep('instruction');
      setMealConfirmed(false);
    } else {
      setStep('complete');
    }
  };

  if (!currentDose || !currentMed) return null;

  const totalMeds = pendingDoses.length;
  const completedMeds = currentIdx;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe pt-6 pb-4 border-b border-border">
        {step !== 'complete' ? (
          <>
            <button onClick={onClose} className="btn-ghost p-2 rounded-xl" aria-label="Close">
              <X size={22} />
            </button>
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 font-medium">
                Medication {Math.min(currentIdx + 1, totalMeds)} of {totalMeds}
              </p>
              <div className="flex gap-1 mt-1">
                {pendingDoses.map((_, i) => (
                  <div
                    key={i}
                    className={cn('h-1 rounded-full transition-all', i < currentIdx ? 'w-6 bg-success-500' : i === currentIdx ? 'w-6 bg-primary-600' : 'w-3 bg-gray-200')}
                  />
                ))}
              </div>
            </div>
            <div className="w-10" />
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* INTRO */}
        {step === 'intro' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center mx-auto">
                <span className="text-3xl">⏰</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Time for your {formatTime(currentDose.scheduledTime.slice(11, 16))} medication
              </h1>
              <p className="text-gray-500">Let&apos;s go through each one together.</p>
            </div>
            <div className="card bg-primary-50 border-primary-100 space-y-2">
              <p className="font-semibold text-primary-800">Coming up:</p>
              {pendingDoses.map(d => {
                const m = getMedication(d.medicationId);
                return m ? (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className="text-xl">{medTypeIcons[m.type]}</span>
                    <div>
                      <p className="font-medium text-gray-900">{m.name} {m.strength}</p>
                      <p className="text-sm text-gray-500">{m.dosage}</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* FOOD CHECK */}
        {step === 'food_check' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Utensils size={36} className="text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentMed.name} needs food
              </h1>
              <p className="text-gray-600 text-lg">{foodInstructionLabels[currentMed.foodInstruction]}</p>
            </div>

            <div className="card border-orange-200 bg-orange-50 text-orange-900 space-y-1">
              <p className="font-semibold">Why this matters:</p>
              <p className="text-sm">Taking {currentMed.name} {foodInstructionLabels[currentMed.foodInstruction].toLowerCase()} helps it work correctly and reduces side effects.</p>
            </div>

            {currentMed.avoidFoods && currentMed.avoidFoods.length > 0 && (
              <div className="card border-danger-200 bg-danger-50 space-y-2">
                <p className="font-semibold text-danger-700 flex items-center gap-2">
                  <AlertTriangle size={18} /> Avoid these foods
                </p>
                {currentMed.avoidFoods.map(f => (
                  <p key={f} className="text-sm text-danger-700">• {f}</p>
                ))}
              </div>
            )}

            <button
              onClick={advance}
              className="w-full btn-success btn-xl flex items-center justify-center gap-3"
            >
              <Utensils size={22} />
              I have eaten a meal
            </button>
            <button onClick={() => setStep('instruction')} className="w-full btn-outline btn-lg">
              Skip (I&apos;ll eat soon)
            </button>
          </div>
        )}

        {/* INSTRUCTION */}
        {step === 'instruction' && (
          <div className="animate-fade-in space-y-5">
            <div className="text-center">
              <MedPill med={currentMed} />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">
                {currentMed.name}
              </h1>
              <p className="text-xl text-gray-500">{currentMed.strength}</p>
            </div>

            <div className="card space-y-3">
              <InfoRow icon="💊" label="Take" value={currentMed.dosage} />
              <InfoRow icon="📋" label="Instructions" value={currentMed.instructions} />
              {currentMed.waterInstruction && (
                <InfoRow icon="💧" label="Water" value={currentMed.waterInstruction} />
              )}
              {currentMed.purpose && (
                <InfoRow icon="🎯" label="Purpose" value={currentMed.purpose} />
              )}
            </div>

            {/* Shape/color quick-check */}
            {(currentMed.color || currentMed.shape || currentMed.imprint) && (
              <div className="card bg-teal-50 border-teal-100 space-y-2">
                <p className="font-semibold text-teal-800 text-sm uppercase tracking-wide">What to look for</p>
                <div className="flex flex-wrap gap-3">
                  {currentMed.color && <ChipInfo label="Color" value={currentMed.color} />}
                  {currentMed.shape && <ChipInfo label="Shape" value={currentMed.shape} />}
                  {currentMed.imprint && <ChipInfo label="Imprint" value={currentMed.imprint} />}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCamera(true)}
              className="w-full btn-outline btn-lg flex gap-3"
            >
              <Camera size={22} className="text-teal-600" />
              Verify this medication (camera)
            </button>
          </div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                <CheckCircle size={48} className="text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Ready to take?</h1>
              <p className="text-gray-500 text-lg">
                {currentMed.name} {currentMed.strength} — {currentMed.dosage}
              </p>
            </div>

            <div className="card bg-success-50 border-success-200 text-center space-y-1">
              <p className="text-success-700 font-semibold text-lg">Confirm you have taken:</p>
              <p className="text-2xl font-bold text-success-800">{currentMed.name}</p>
              <p className="text-success-600">{currentMed.dosage} · {currentMed.strength}</p>
              {mealConfirmed && (
                <p className="text-success-600 text-sm flex items-center justify-center gap-1 mt-1">
                  <Utensils size={14} /> Meal confirmed ✓
                </p>
              )}
            </div>
          </div>
        )}

        {/* NEXT TRANSITION */}
        {step === 'next' && (
          <div className="animate-fade-in space-y-4 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
              <CheckCircle size={36} className="text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pendingDoses[currentIdx - 1] ? getMedication(pendingDoses[currentIdx - 1].medicationId)?.name : ''} ✓
            </h2>
            <p className="text-gray-500">Next up:</p>
            <div className="card border-primary-100 bg-primary-50 mx-auto max-w-xs">
              <p className="font-bold text-primary-800 text-xl">{getMedication(pendingDoses[currentIdx]?.medicationId)?.name}</p>
              <p className="text-primary-600">{getMedication(pendingDoses[currentIdx]?.medicationId)?.strength}</p>
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {step === 'complete' && (
          <div className="animate-fade-in space-y-6 py-6 text-center">
            <div className="w-28 h-28 rounded-full bg-success-50 flex items-center justify-center mx-auto">
              <span className="text-5xl">🎉</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wonderful!</h1>
              <p className="text-gray-500 mt-2 text-lg">You&apos;ve completed your medication routine.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="card text-center">
                <p className="text-3xl font-bold text-success-600">{completedMeds}</p>
                <p className="text-sm text-gray-500">Taken</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-primary-600">
                  {pendingDoses.filter(d => d.status === 'skipped').length}
                </p>
                <p className="text-sm text-gray-500">Skipped</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Great job staying on track with your medications!</p>
            <button onClick={onComplete} className="w-full btn-success btn-xl">
              Done
            </button>
          </div>
        )}

        {/* Camera mock */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex items-center justify-between p-6">
              <button onClick={() => setShowCamera(false)} className="text-white p-2">
                <ArrowLeft size={24} />
              </button>
              <p className="text-white font-semibold">Compare Medication</p>
              <div />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
              <div className="w-64 h-64 border-4 border-dashed border-white/40 rounded-3xl flex items-center justify-center">
                <div className="text-center text-white/70 space-y-2">
                  <Camera size={48} className="mx-auto" />
                  <p className="text-sm">Point camera at pill</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 w-full max-w-xs text-white text-center">
                <p className="font-semibold mb-1">Comparing with:</p>
                <p className="text-xl font-bold">{currentMed.name} {currentMed.strength}</p>
                <p className="text-sm opacity-70">{currentMed.color} · {currentMed.shape} · {currentMed.imprint}</p>
              </div>
              <button
                onClick={() => setShowCamera(false)}
                className="bg-success-600 text-white font-bold py-4 px-10 rounded-2xl text-xl"
              >
                ✓ Looks correct
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step !== 'complete' && !showCamera && (
        <div className="px-6 pb-safe pb-8 pt-4 border-t border-border space-y-3">
          {step === 'confirm' ? (
            <button onClick={advance} className="w-full btn-success btn-xl animate-pulse-soft">
              <CheckCircle size={24} />
              I HAVE TAKEN THIS MEDICATION
            </button>
          ) : step === 'next' ? (
            <button onClick={advance} className="w-full btn-primary btn-xl">
              Continue <ChevronRight size={22} />
            </button>
          ) : (
            <button onClick={advance} className="w-full btn-primary btn-xl">
              Continue <ChevronRight size={22} />
            </button>
          )}
          {(step === 'instruction' || step === 'confirm') && (
            <button onClick={skipDose} className="w-full btn-outline btn-lg text-gray-500">
              Skip this medication
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function ChipInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl px-4 py-2 border border-teal-100">
      <p className="text-xs text-teal-600 font-medium">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
