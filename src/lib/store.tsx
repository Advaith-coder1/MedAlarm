'use client';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, Medication, DoseRecord, DoseStatus, User, Document, Notification } from '@/types';
import {
  DEMO_SENIOR, DEMO_CAREGIVER, DEMO_FAMILY_MEMBERS,
  DEMO_MEDICATIONS, DEMO_DOSE_RECORDS, DEMO_DOCUMENTS, DEMO_NOTIFICATIONS,
} from '@/lib/demo-data';

const STORAGE_KEY = 'medalarm_state_v1';

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ROLE'; role: User['role'] }
  | { type: 'RECORD_DOSE'; doseId: string; status: DoseStatus; takenAt?: string }
  | { type: 'ADD_MEDICATION'; medication: Medication }
  | { type: 'UPDATE_MEDICATION'; medication: Medication }
  | { type: 'DELETE_MEDICATION'; id: string }
  | { type: 'ADD_DOCUMENT'; doc: Document }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'SET_WORKFLOW_MED'; id: string | null }
  | { type: 'SET_ACTIVE_SENIOR'; id: string | null }
  | { type: 'SET_TEXT_SIZE'; multiplier: number }
  | { type: 'SET_SOUND'; enabled: boolean }
  | { type: 'LOAD_STATE'; state: AppState };

function initialState(): AppState {
  return {
    currentUser: null,
    users: [DEMO_SENIOR, DEMO_CAREGIVER],
    familyMembers: DEMO_FAMILY_MEMBERS,
    medications: DEMO_MEDICATIONS,
    doseRecords: DEMO_DOSE_RECORDS,
    documents: DEMO_DOCUMENTS,
    notifications: DEMO_NOTIFICATIONS,
    activeSeniorId: DEMO_SENIOR.id,
    workflowMedicationId: null,
    textSizeMultiplier: 1,
    soundEnabled: true,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...initialState(), currentUser: null };
    case 'SET_ROLE':
      if (!state.currentUser) return state;
      return { ...state, currentUser: { ...state.currentUser, role: action.role } };
    case 'RECORD_DOSE':
      return {
        ...state,
        doseRecords: state.doseRecords.map(r =>
          r.id === action.doseId
            ? { ...r, status: action.status, takenAt: action.takenAt ?? r.takenAt }
            : r
        ),
      };
    case 'ADD_MEDICATION':
      return { ...state, medications: [...state.medications, action.medication] };
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(m =>
          m.id === action.medication.id ? action.medication : m
        ),
      };
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(m =>
          m.id === action.id ? { ...m, isActive: false } : m
        ),
      };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.doc] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, isRead: true } : n
        ),
      };
    case 'SET_WORKFLOW_MED':
      return { ...state, workflowMedicationId: action.id };
    case 'SET_ACTIVE_SENIOR':
      return { ...state, activeSeniorId: action.id };
    case 'SET_TEXT_SIZE':
      return { ...state, textSizeMultiplier: action.multiplier };
    case 'SET_SOUND':
      return { ...state, soundEnabled: action.enabled };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loginAs: (role: 'senior' | 'caregiver') => void;
  recordDose: (doseId: string, status: DoseStatus) => void;
  getTodayDoses: (userId?: string) => DoseRecord[];
  getPendingDoses: (userId?: string) => DoseRecord[];
  getMedication: (id: string) => Medication | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    if (typeof window === 'undefined') return initialState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        // Merge fresh demo data for dose records each session
        return { ...parsed, doseRecords: DEMO_DOSE_RECORDS };
      }
    } catch {}
    return initialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const loginAs = useCallback((role: 'senior' | 'caregiver') => {
    const user = role === 'senior' ? DEMO_SENIOR : DEMO_CAREGIVER;
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const recordDose = useCallback((doseId: string, status: DoseStatus) => {
    const takenAt = status === 'taken' ? new Date().toISOString() : undefined;
    dispatch({ type: 'RECORD_DOSE', doseId, status, takenAt });
  }, []);

  const getTodayDoses = useCallback((userId?: string) => {
    const uid = userId ?? state.activeSeniorId ?? state.currentUser?.id;
    const today = new Date().toISOString().slice(0, 10);
    return state.doseRecords
      .filter(r => r.userId === uid && r.scheduledTime.startsWith(today))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [state.doseRecords, state.activeSeniorId, state.currentUser]);

  const getPendingDoses = useCallback((userId?: string) => {
    return getTodayDoses(userId).filter(r => r.status === 'pending' || r.status === 'late');
  }, [getTodayDoses]);

  const getMedication = useCallback((id: string) => {
    return state.medications.find(m => m.id === id);
  }, [state.medications]);

  return (
    <StoreContext.Provider value={{ state, dispatch, loginAs, recordDose, getTodayDoses, getPendingDoses, getMedication }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
