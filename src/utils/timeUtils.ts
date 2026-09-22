import { DayOfWeek, StudySession, AppLanguage } from '../types';

export const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const DAY_LABELS: Record<
  DayOfWeek,
  { fr: string; en: string; ar: string; shortFr: string; shortEn: string; shortAr: string }
> = {
  monday: { fr: 'Lundi', en: 'Monday', ar: 'الإثنين', shortFr: 'Lun', shortEn: 'Mon', shortAr: 'إثن' },
  tuesday: { fr: 'Mardi', en: 'Tuesday', ar: 'الثلاثاء', shortFr: 'Mar', shortEn: 'Tue', shortAr: 'ثلا' },
  wednesday: { fr: 'Mercredi', en: 'Wednesday', ar: 'الأربعاء', shortFr: 'Mer', shortEn: 'Wed', shortAr: 'أرب' },
  thursday: { fr: 'Jeudi', en: 'Thursday', ar: 'الخميس', shortFr: 'Jeu', shortEn: 'Thu', shortAr: 'خمي' },
  friday: { fr: 'Vendredi', en: 'Friday', ar: 'الجمعة', shortFr: 'Ven', shortEn: 'Fri', shortAr: 'جمع' },
  saturday: { fr: 'Samedi', en: 'Saturday', ar: 'السبت', shortFr: 'Sam', shortEn: 'Sat', shortAr: 'سبت' },
  sunday: { fr: 'Dimanche', en: 'Sunday', ar: 'الأحد', shortFr: 'Dim', shortEn: 'Sun', shortAr: 'أحد' }
};

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  const map: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  return map[jsDay];
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const hours = isNaN(parts[0]) ? 0 : parts[0];
  const minutes = isNaN(parts[1]) ? 0 : parts[1];
  return hours * 60 + minutes;
}

export function getMinutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

export type SessionLiveStatus = 'passed' | 'in_progress' | 'upcoming_soon_15' | 'upcoming_soon_30' | 'upcoming';

export function getSessionStatus(session: StudySession, today = getTodayDayOfWeek()): SessionLiveStatus {
  if (session.completed) {
    return 'passed';
  }

  const todayIdx = DAYS_ORDER.indexOf(today);
  const sessionIdx = DAYS_ORDER.indexOf(session.day);

  if (sessionIdx < todayIdx) {
    return 'passed';
  }
  if (sessionIdx > todayIdx) {
    return 'upcoming';
  }

  // Same day
  const nowMinutes = getMinutesNow();
  const startMin = parseTimeToMinutes(session.startTime);
  const endMin = parseTimeToMinutes(session.endTime);

  if (nowMinutes >= endMin) {
    return 'passed';
  }
  if (nowMinutes >= startMin && nowMinutes < endMin) {
    return 'in_progress';
  }

  const diffToStart = startMin - nowMinutes;
  if (diffToStart <= 15 && diffToStart >= 0) {
    return 'upcoming_soon_15';
  }
  if (diffToStart <= 30 && diffToStart > 15) {
    return 'upcoming_soon_30';
  }

  return 'upcoming';
}

export function getRemainingSeconds(targetTime: string, targetDay: DayOfWeek): number {
  const now = new Date();
  const today = getTodayDayOfWeek();
  const todayIndex = DAYS_ORDER.indexOf(today);
  const targetIndex = DAYS_ORDER.indexOf(targetDay);

  let daysDiff = targetIndex - todayIndex;
  if (daysDiff < 0) {
    daysDiff += 7; // next week
  }

  const [tHours, tMinutes] = targetTime.split(':').map(Number);
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysDiff);
  targetDate.setHours(tHours || 0, tMinutes || 0, 0, 0);

  // If same day but time already passed today, target is next week
  if (daysDiff === 0 && targetDate.getTime() < now.getTime()) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  }
  return `${pad(mins)}m ${pad(secs)}s`;
}

export function formatWeekDuration(seconds: number, language: AppLanguage = 'fr'): string {
  if (seconds <= 0) return '00:00';
  if (seconds < 86400) {
    return formatDuration(seconds);
  }

  const days = Math.floor(seconds / 86400);
  const rem = seconds % 86400;
  const hrs = Math.floor(rem / 3600);
  const mins = Math.floor((rem % 3600) / 60);
  const secs = Math.floor(rem % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (language === 'ar') {
    return `${days} يوم و ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  if (language === 'en') {
    return `${days}d ${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  }
  return `${days}j ${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

export interface SessionLiveCountdown {
  isPassed: boolean;
  isInProgress: boolean;
  secondsRemaining: number;
  formatted: string;
  label: string;
}

export function getSessionLiveCountdown(session: StudySession, language: AppLanguage): SessionLiveCountdown {
  // 1. Manually completed
  if (session.completed) {
    return {
      isPassed: true,
      isInProgress: false,
      secondsRemaining: 0,
      formatted: '--:--:--',
      label: language === 'ar' ? 'حصة فاتت (مكتملة)' : language === 'en' ? 'Completed' : 'Séance passée'
    };
  }

  const today = getTodayDayOfWeek();
  const todayIdx = DAYS_ORDER.indexOf(today);
  const sessionIdx = DAYS_ORDER.indexOf(session.day);

  // 2. Day in past of current week
  if (sessionIdx < todayIdx) {
    return {
      isPassed: true,
      isInProgress: false,
      secondsRemaining: 0,
      formatted: '--:--:--',
      label: language === 'ar' ? 'حصة فاتت' : language === 'en' ? 'Session ended' : 'Séance passée'
    };
  }

  // 3. Same Day
  if (sessionIdx === todayIdx) {
    const now = new Date();
    const nowMin = getMinutesNow();
    const startMin = parseTimeToMinutes(session.startTime);
    const endMin = parseTimeToMinutes(session.endTime);

    // Passed today
    if (nowMin >= endMin) {
      return {
        isPassed: true,
        isInProgress: false,
        secondsRemaining: 0,
        formatted: '--:--:--',
        label: language === 'ar' ? 'حصة فاتت' : language === 'en' ? 'Session ended' : 'Séance passée'
      };
    }

    // In Progress right now
    if (nowMin >= startMin && nowMin < endMin) {
      const endTotalSecs = endMin * 60;
      const nowTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const remSecs = Math.max(0, endTotalSecs - nowTotalSecs);
      return {
        isPassed: false,
        isInProgress: true,
        secondsRemaining: remSecs,
        formatted: formatDuration(remSecs),
        label: language === 'ar' ? 'جارية الآن • تنتهي بعد :' : language === 'en' ? 'In progress • Ends in:' : 'En cours • Fin dans :'
      };
    }

    // Upcoming today
    const startTotalSecs = startMin * 60;
    const nowTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const remSecs = Math.max(0, startTotalSecs - nowTotalSecs);
    return {
      isPassed: false,
      isInProgress: false,
      secondsRemaining: remSecs,
      formatted: formatDuration(remSecs),
      label: language === 'ar' ? 'العد التنازلي للبداية :' : language === 'en' ? 'Starts in:' : 'Début dans :'
    };
  }

  // 4. Future Day this week
  const now = new Date();
  const daysDiff = sessionIdx - todayIdx;
  const [h, m] = session.startTime.split(':').map((p) => parseInt(p, 10));
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysDiff);
  targetDate.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);

  const diffSecs = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
  return {
    isPassed: false,
    isInProgress: false,
    secondsRemaining: diffSecs,
    formatted: formatWeekDuration(diffSecs, language),
    label: language === 'ar' ? 'تبدأ بعد :' : language === 'en' ? 'Starts in:' : 'Début dans :'
  };
}

/**
 * Returns true if Sunday midnight (00:00:00) has passed since the last reset.
 * This automatically triggers resetting all sessions so countdowns return every Sunday at midnight.
 */
export function shouldPerformSundayMidnightReset(lastResetTimestampStr: string | null): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1..6 is Mon..Sat
  const diffToSunday = day === 0 ? 0 : day; // days since most recent Sunday 00:00
  const sundayMidnight = new Date(now);
  sundayMidnight.setDate(now.getDate() - diffToSunday);
  sundayMidnight.setHours(0, 0, 0, 0);

  if (!lastResetTimestampStr) {
    return true;
  }
  const lastReset = parseInt(lastResetTimestampStr, 10);
  if (isNaN(lastReset)) return true;

  return lastReset < sundayMidnight.getTime();
}

export function getNextUpcomingSession(sessions: StudySession[]): {
  session: StudySession;
  isCurrent: boolean;
  secondsRemaining: number;
} | null {
  if (!sessions || sessions.length === 0) return null;

  const today = getTodayDayOfWeek();
  const nowMin = getMinutesNow();

  // Exclude completed sessions so marking a session completed advances to the next Etude
  const pendingSessions = sessions.filter((s) => !s.completed);
  const activePool = pendingSessions.length > 0 ? pendingSessions : sessions;

  // 1. Check if there is an in-progress session right now that is NOT completed
  const currentSession = activePool.find((s) => {
    if (s.day !== today) return false;
    const start = parseTimeToMinutes(s.startTime);
    const end = parseTimeToMinutes(s.endTime);
    return nowMin >= start && nowMin < end;
  });

  if (currentSession && !currentSession.completed) {
    const endSecs = getRemainingSeconds(currentSession.endTime, today);
    return {
      session: currentSession,
      isCurrent: true,
      secondsRemaining: endSecs
    };
  }

  // 2. Find the earliest upcoming session in chronological order
  let closestSession: StudySession | null = null;
  let minSecs = Infinity;

  activePool.forEach((s) => {
    // If it's already marked as completed, skip it
    if (s.completed && pendingSessions.length > 0) return;

    const secs = getRemainingSeconds(s.startTime, s.day);
    if (secs < minSecs) {
      minSecs = secs;
      closestSession = s;
    }
  });

  if (closestSession) {
    return {
      session: closestSession,
      isCurrent: false,
      secondsRemaining: minSecs
    };
  }

  return null;
}
