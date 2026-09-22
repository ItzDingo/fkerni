export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type AppLanguage = 'fr' | 'en' | 'ar';

export type SessionColor =
  | 'blue'
  | 'indigo'
  | 'cyan'
  | 'purple'
  | 'emerald'
  | 'amber'
  | 'silver'
  | 'rose'
  | 'orange'
  | 'teal'
  | 'sky';

export interface StudySession {
  id: string;
  day: DayOfWeek;
  title: string; // e.g. "Étude", "Étude de Maths"
  subject: string; // e.g. "Mathématiques", "Physique"
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  room?: string;
  notes?: string;
  color: SessionColor;
  completed?: boolean;
  supabase_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type QuoteCategory = 'voluntary' | 'after_notif' | 'long_absence' | 'random';

export interface FunnyQuote {
  id: string;
  textDerja: string; // Tunisian Derja (Franco-Arabe)
  textAr: string; // Arabic script
  textFr: string; // French
  textEn: string; // English
  category: QuoteCategory;
  emoji?: string;
}

export interface NotificationSettings {
  enable30MinNotification: boolean;
  enable15MinAlarm: boolean;
  alarmSound: 'chime' | 'digital' | 'radar' | 'zen';
  alarmVolume: number; // 0 to 100
  vibration: boolean;
  enableQuoteAudio: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface AppState {
  sessions: StudySession[];
  selectedDay: DayOfWeek;
  language: AppLanguage;
  notifications: NotificationSettings;
  supabase: SupabaseConfig;
  lastVisitTimestamp: number;
  triggerType: 'voluntary' | 'after_notif' | 'long_absence';
}
