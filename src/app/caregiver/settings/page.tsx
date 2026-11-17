'use client';
import { useState } from 'react';
import { Bell, Sun, Moon, Volume2, VolumeX, LogOut, Shield, User, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700 font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          value ? 'bg-primary-600' : 'bg-gray-200'
        )}
        aria-checked={value}
        role="switch"
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
          value ? 'translate-x-7' : 'translate-x-1'
        )} />
      </button>
    </div>
  );
}

export default function CaregiverSettings() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const user = state.currentUser;

  const [notifications, setNotifications] = useState({
    missedDose: true,
    lowRefill: true,
    dailySummary: false,
    emailAlerts: true,
  });

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <section className="card-lg">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user.name[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
            <span className="badge bg-primary-50 text-primary-700 border border-primary-200 mt-1">Caregiver</span>
          </div>
        </div>
        <button className="w-full btn-outline btn-md flex gap-2">
          <User size={18} /> Edit Profile
        </button>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="section-title flex items-center gap-2">
          <Bell size={20} /> Notifications
        </h2>
        <div className="card divide-y divide-border">
          <Toggle
            value={notifications.missedDose}
            onChange={v => setNotifications(n => ({ ...n, missedDose: v }))}
            label="Alert when dose is missed"
          />
          <Toggle
            value={notifications.lowRefill}
            onChange={v => setNotifications(n => ({ ...n, lowRefill: v }))}
            label="Alert on low refills"
          />
          <Toggle
            value={notifications.dailySummary}
            onChange={v => setNotifications(n => ({ ...n, dailySummary: v }))}
            label="Daily adherence summary"
          />
          <Toggle
            value={notifications.emailAlerts}
            onChange={v => setNotifications(n => ({ ...n, emailAlerts: v }))}
            label="Email alerts"
          />
        </div>
      </section>

      {/* Accessibility */}
      <section>
        <h2 className="section-title flex items-center gap-2">
          <Sun size={20} /> Accessibility
        </h2>
        <div className="card space-y-4">
          <div>
            <p className="label mb-2">Text size</p>
            <div className="flex gap-2">
              {[
                { label: 'Standard', value: 1 },
                { label: 'Large', value: 1.15 },
                { label: 'Extra Large', value: 1.3 },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => dispatch({ type: 'SET_TEXT_SIZE', multiplier: opt.value })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                    state.textSizeMultiplier === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Sound alerts</p>
              <p className="text-sm text-gray-500">Play sound with reminders</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SOUND', enabled: !state.soundEnabled })}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors',
                state.soundEnabled ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-500'
              )}
            >
              {state.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {state.soundEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="section-title flex items-center gap-2">
          <Shield size={20} /> Account
        </h2>
        <div className="card divide-y divide-border">
          <SettingRow icon={<Shield size={18} />} label="Privacy & Security" />
          <SettingRow icon={<User size={18} />} label="Connected Accounts" />
        </div>
      </section>

      {/* Switch to senior */}
      <div className="card border-teal-200 bg-teal-50">
        <p className="font-semibold text-teal-800 mb-2">View as Patient</p>
        <p className="text-sm text-teal-700 mb-3">Switch to the senior interface to see what your family member sees.</p>
        <button
          onClick={() => {
            dispatch({ type: 'SET_USER', payload: { ...user, role: 'senior' } });
            router.push('/senior/home');
          }}
          className="btn-teal btn-md w-full"
        >
          Switch to Patient View
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full btn-outline btn-lg flex gap-3 text-gray-600 hover:text-danger-600 hover:border-danger-300"
      >
        <LogOut size={20} /> Sign Out
      </button>

      <div className="text-center space-y-1 pb-4">
        <p className="text-xs text-gray-400">MedAlarm v1.0.0</p>
        <p className="text-xs text-gray-400">Remember. Verify. Take. Record.</p>
      </div>
    </div>
  );
}

function SettingRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors -mx-5 px-5 rounded-xl">
      <div className="flex items-center gap-3 text-gray-700">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
}
