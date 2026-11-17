'use client';
import { Phone, MessageCircle, Mail, ChevronRight, HelpCircle, LogOut, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

const FAQ = [
  {
    q: 'How do I take my medications?',
    a: 'Go to the Home screen and press "START MY MEDICATIONS". The app will guide you through each one step by step.',
  },
  {
    q: 'What if I already took a medication?',
    a: 'On the Home screen, tap on the medication and select "I already took this". The app will record it in your history.',
  },
  {
    q: 'What does it mean when a medication says "Take with food"?',
    a: 'You should eat a meal or snack before or while taking this medication. The app will ask you to confirm you have eaten.',
  },
  {
    q: 'How do I add a new medication?',
    a: 'Go to "My Medications" and tap the "Add" button. You can type it manually or take a photo of your prescription bottle.',
  },
  {
    q: 'How can my family see my medications?',
    a: 'Ask a family member or caregiver to create a MedAlarm account and connect to you using the invitation feature in Settings.',
  },
];

export default function SeniorHelp() {
  const { dispatch } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    router.replace('/login');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>

      {/* Caregiver contact */}
      <div className="card-lg bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-teal-100 text-sm">Your Caregiver</p>
            <p className="text-xl font-bold">James Thompson</p>
            <p className="text-teal-200 text-sm">Son</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ContactBtn icon={<Phone size={20} />} label="Call" />
          <ContactBtn icon={<MessageCircle size={20} />} label="Message" />
          <ContactBtn icon={<Mail size={20} />} label="Email" />
        </div>
      </div>

      {/* Emergency */}
      <div className="card border-danger-200 bg-danger-50">
        <p className="font-bold text-danger-700 text-lg mb-1">Emergency</p>
        <p className="text-danger-600 text-sm mb-3">If you have a medical emergency, call 911 immediately.</p>
        <a href="tel:911" className="btn-danger btn-lg w-full flex gap-2 justify-center">
          <Phone size={20} /> Call 911
        </a>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="section-title flex items-center gap-2">
          <HelpCircle size={20} /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <details key={i} className="card cursor-pointer group">
              <summary className="flex items-center justify-between gap-3 font-semibold text-gray-900 list-none">
                {item.q}
                <ChevronRight size={18} className="text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="card text-center space-y-1">
        <p className="text-2xl mb-1">💊</p>
        <p className="font-bold text-gray-900">MedAlarm</p>
        <p className="text-xs text-gray-400">Version 1.0.0</p>
        <p className="text-xs text-gray-400">Remember. Verify. Take. Record.</p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full btn-outline btn-lg flex gap-3 text-gray-600 hover:text-danger-600 hover:border-danger-300"
      >
        <LogOut size={20} /> Sign Out
      </button>
    </div>
  );
}

function ContactBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="bg-white/20 hover:bg-white/30 rounded-xl py-3 flex flex-col items-center gap-1 text-white text-sm font-medium transition-colors">
      {icon}
      {label}
    </button>
  );
}
