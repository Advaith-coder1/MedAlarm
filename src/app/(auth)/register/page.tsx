'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ChevronRight } from 'lucide-react';

type Step = 'role' | 'info';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<'senior' | 'caregiver' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { loginAs } = useStore();
  const router = useRouter();

  const handleRoleSelect = (r: 'senior' | 'caregiver') => {
    setRole(r);
    setStep('info');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(role!);
    router.push(role === 'senior' ? '/senior/home' : '/caregiver/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-card-lg mb-4">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        </div>

        {step === 'role' && (
          <div className="card-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Who are you?</h2>
            <p className="text-gray-500 text-sm">This helps us set up the right experience for you.</p>
            <button
              onClick={() => handleRoleSelect('senior')}
              className="w-full border-2 border-teal-200 hover:border-teal-500 hover:bg-teal-50 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">👴</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">I take medications</p>
                  <p className="text-gray-500 text-sm">Patient / Senior interface</p>
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-teal-600" />
            </button>
            <button
              onClick={() => handleRoleSelect('caregiver')}
              className="w-full border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🧑‍⚕️</span>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">I help someone</p>
                  <p className="text-gray-500 text-sm">Caregiver / Family interface</p>
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-primary-600" />
            </button>
          </div>
        )}

        {step === 'info' && (
          <div className="card-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Your Details</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Margaret Thompson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Create a strong password" required minLength={8} />
              </div>
              <button type="submit" className="w-full btn-primary btn-lg mt-2">
                Create Account
              </button>
            </form>
            <button onClick={() => setStep('role')} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-primary-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
