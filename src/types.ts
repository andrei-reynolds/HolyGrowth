export enum QuestCategory {
  EXERCISE = 'exercise',
  MEDITATION = 'meditation',
  READING = 'reading',
  CUSTOM = 'custom'
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  exp: number;
  level: number;
  role: 'user' | 'admin';
}

export interface Quest {
  id: string;
  userId?: string; // null for predefined
  title: string;
  description?: string;
  category: QuestCategory;
  points: number;
  isPredefined: boolean;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: any; // Firestore Timestamp
}

export interface Schedule {
  id: string;
  userId: string;
  questId: string;
  date: string; // YYYY-MM-DD
}

export interface BibleQuote {
  text: string;
  reference: string;
}
