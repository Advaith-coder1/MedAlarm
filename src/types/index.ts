export type UserRole = 'senior' | 'caregiver';
export type MedType = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'patch' | 'other';
export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'pending' | 'upcoming' | 'late';
export type FoodInstruction = 'with_food' | 'with_meal' | 'before_food' | 'empty_stomach' | 'after_meal' | 'any_time';
export type ScheduleFrequency = 'once_daily' | 'twice_daily' | 'three_times' | 'every_4h' | 'every_6h' | 'every_8h' | 'every_12h' | 'specific_days' | 'as_needed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  caregiverId: string;
  relationship: string;
  user: User;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  genericName: string;
  brandName?: string;
  strength: string;
  dosage: string;
  type: MedType;
  color?: string;
  shape?: string;
  imprint?: string;
  purpose: string;
  instructions: string;
  foodInstruction: FoodInstruction;
  waterInstruction?: string;
  avoidFoods?: string[];
  imageUrl?: string;
  schedule: MedicationSchedule;
  prescribedBy?: string;
  pharmacy?: string;
  refillsRemaining?: number;
  nextRefillDate?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isPaused: boolean;
  notes?: string;
  createdAt: string;
}

export interface MedicationSchedule {
  frequency: ScheduleFrequency;
  times: string[];
  daysOfWeek?: number[];
  intervalHours?: number;
  anchorTime?: string;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  userId: string;
  scheduledTime: string;
  takenAt?: string;
  status: DoseStatus;
  mealConfirmed?: boolean;
  notes?: string;
  medication?: Medication;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  type: 'prescription' | 'medication_list' | 'lab_result' | 'other';
  fileUrl?: string;
  uploadedAt: string;
  extractedData?: Partial<Medication>;
  isProcessed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'missed' | 'refill' | 'info' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  familyMembers: FamilyMember[];
  medications: Medication[];
  doseRecords: DoseRecord[];
  documents: Document[];
  notifications: Notification[];
  activeSeniorId: string | null;
  workflowMedicationId: string | null;
  textSizeMultiplier: number;
  soundEnabled: boolean;
}
