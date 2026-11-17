'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { loginAs } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (role: 'senior' | 'caregiver') => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    loginAs(role);
    router.push(role === 'senior' ? '/senior/home' : '/caregiver/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-card-lg mb-4">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MedAlarm</h1>
          <p className="text-gray-500 mt-1 text-center text-sm">Remember. Verify. Take. Record.</p>
        </div>

        {/* Form */}
        <div className="card-lg">
          <h2 className="text-xl font-semibold mb-5">Sign in</h2>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPw(v => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo buttons */}
        <div className="mt-5 space-y-3">
          <p className="text-center text-xs text-gray-500 font-medium uppercase tracking-wide">Demo — choose your role</p>
          <button
            onClick={() => handleDemoLogin('senior')}
            disabled={loading}
            className="w-full btn-teal btn-lg flex gap-3"
          >
            <span className="text-2xl">👴</span>
            <div className="text-left">
              <p className="font-semibold">I am a Patient / Senior</p>
              <p className="text-sm opacity-80">Margaret Thompson</p>
            </div>
          </button>
          <button
            onClick={() => handleDemoLogin('caregiver')}
            disabled={loading}
            className="w-full btn-primary btn-lg flex gap-3"
          >
            <span className="text-2xl">🧑‍⚕️</span>
            <div className="text-left">
              <p className="font-semibold">I am a Caregiver / Family</p>
              <p className="text-sm opacity-80">James Thompson</p>
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-primary-600 font-medium hover:underline">Create one</a>
        </p>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield size={12} />
          <span>Protected by healthcare-grade encryption</span>
        </div>
      </div>
    </div>
  );
}
