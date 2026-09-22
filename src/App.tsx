import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  StudySession,
  DayOfWeek,
  AppLanguage,
  NotificationSettings
} from './types';
import { INITIAL_SCHEDULE } from './data/defaultSchedule';
import { ALERT_MESSAGES } from './config/customContent';
import { getTodayDayOfWeek, parseTimeToMinutes, getMinutesNow, shouldPerformSundayMidnightReset } from './utils/timeUtils';
import { stopAlarm15m } from './utils/audio';
import {
  fetchSessionsFromSupabase,
  syncSessionToSupabase,
  subscribeToLiveSessions,
  getCachedQuotes,
  selectQuoteToDisplay,
  fetchQuotesFromSupabase,
  subscribeToLiveQuotes
} from './services/supabase';
import {
  initNotificationService,
  sendInstantNotification,
  scheduleAllSessionsNotifications
} from './services/notificationService';

// Subcomponents
import { LiquidNavbar } from './components/LiquidNavbar';
import { NextSessionCard } from './components/NextSessionCard';
import { WeeklySchedule } from './components/WeeklySchedule';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SessionModal } from './components/SessionModal';
import { AlarmNotificationModal } from './components/AlarmNotificationModal';
import { AndroidBottomNav, ActiveTab } from './components/AndroidBottomNav';
import { OpeningIntroOverlay } from './components/OpeningIntroOverlay';
import { SecretLoveModal } from './components/SecretLoveModal';

export default function App() {
  // 1. Core State
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('fkerni_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SCHEDULE;
      }
    }
    return INITIAL_SCHEDULE;
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('fkerni_lang') as AppLanguage) || 'fr';
  });
  const [preferDerja, setPreferDerja] = useState<boolean>(() => {
    const saved = localStorage.getItem('fkerni_prefer_derja');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

  // 2. Opening Screen / Intro funny quote overlay state
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);

  // 3. Notifications settings
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('fkerni_notif_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      enable30MinNotification: true,
      enable15MinAlarm: true,
      alarmSound: 'digital',
      alarmVolume: 90,
      vibration: true,
      enableQuoteAudio: true
    };
  });

  // 4. Opening quote (selected ONCE on app open: welcome message on first open, Supabase/cached quote after)
  const [openingQuote] = useState<{ text: string; emoji: string }>(() => {
    const hasOpenedBefore = localStorage.getItem('fkerni_has_opened_before');
    if (!hasOpenedBefore) {
      return { text: "Ahla bMallouka 😊", emoji: "👋" };
    }
    const cachedQuotes = getCachedQuotes();
    return selectQuoteToDisplay(cachedQuotes);
  });

  // 5. Modals
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [alarmModalData, setAlarmModalData] = useState<{
    isOpen: boolean;
    type: 'alarm_15m' | 'notification_30m';
    session: StudySession | null;
  }>({
    isOpen: false,
    type: 'alarm_15m',
    session: null
  });

  // Track already notified sessions for today to prevent duplicates
  const notified30mRef = useRef<Set<string>>(new Set());
  const alarmed15mRef = useRef<Set<string>>(new Set());

  // 6. Initial Boot: Live Supabase Fetch (Sessions & Quotes) + Realtime + Auto-sync on Connection
  useEffect(() => {
    localStorage.setItem('fkerni_last_visit', Date.now().toString());

    // Initialize notification channels & request permissions
    initNotificationService();

    // Fetch live sessions from Supabase and cache locally
    fetchSessionsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setSessions(data);
        localStorage.setItem('fkerni_sessions', JSON.stringify(data));
        setIsSupabaseLive(true);
      }
    });

    // Fetch live quotes from Supabase and silently cache locally for future app launches
    fetchQuotesFromSupabase().then((quotes) => {
      if (quotes && quotes.length > 0) {
        localStorage.setItem('fkerni_cached_quotes', JSON.stringify(quotes));
      }
    });

    // Subscribe to live realtime changes from Supabase (sessions)
    const unsubscribeSessions = subscribeToLiveSessions((updated) => {
      if (updated && updated.length > 0) {
        setSessions(updated);
        localStorage.setItem('fkerni_sessions', JSON.stringify(updated));
        setIsSupabaseLive(true);
      }
    });

    // Subscribe to live realtime changes from Supabase (funny quotes)
    const unsubscribeQuotes = subscribeToLiveQuotes((updatedQuotes) => {
      if (updatedQuotes && updatedQuotes.length > 0) {
        localStorage.setItem('fkerni_cached_quotes', JSON.stringify(updatedQuotes));
      }
    });

    // Auto-sync whenever internet or Wi-Fi reconnects
    const handleOnlineSync = async () => {
      console.log('🌐 Online connection restored! Syncing data with Supabase...');
      const freshSessions = await fetchSessionsFromSupabase();
      if (freshSessions && freshSessions.length > 0) {
        setSessions(freshSessions);
        localStorage.setItem('fkerni_sessions', JSON.stringify(freshSessions));
        setIsSupabaseLive(true);
      }
      const freshQuotes = await fetchQuotesFromSupabase();
      if (freshQuotes && freshQuotes.length > 0) {
        localStorage.setItem('fkerni_cached_quotes', JSON.stringify(freshQuotes));
      }
    };

    window.addEventListener('online', handleOnlineSync);
    window.addEventListener('focus', handleOnlineSync);

    return () => {
      unsubscribeSessions();
      unsubscribeQuotes();
      window.removeEventListener('online', handleOnlineSync);
      window.removeEventListener('focus', handleOnlineSync);
    };
  }, []);

  // Sync scheduled native notifications on device whenever sessions change
  useEffect(() => {
    scheduleAllSessionsNotifications(sessions, notifications);
  }, [sessions, notifications]);

  // 7. Automatic Sunday Midnight Refresh
  useEffect(() => {
    const checkSundayReset = () => {
      const lastReset = localStorage.getItem('fkerni_last_sunday_reset');
      if (shouldPerformSundayMidnightReset(lastReset)) {
        setSessions((prev) =>
          prev.map((s) => ({
            ...s,
            completed: false
          }))
        );
        notified30mRef.current.clear();
        alarmed15mRef.current.clear();
        localStorage.setItem('fkerni_last_sunday_reset', Date.now().toString());
      }
    };

    checkSundayReset();
    const timer = setInterval(checkSundayReset, 60000);
    return () => clearInterval(timer);
  }, []);

  // Save sessions to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('fkerni_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save language
  useEffect(() => {
    localStorage.setItem('fkerni_lang', language);
  }, [language]);

  // Save preferDerja
  useEffect(() => {
    localStorage.setItem('fkerni_prefer_derja', String(preferDerja));
  }, [preferDerja]);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem('fkerni_notif_settings', JSON.stringify(notifications));
  }, [notifications]);

  // 8. Proximity Monitoring Loop (Checks every 10 seconds)
  // Sends ONLY real system notifications to the phone (no in-app popups)
  useEffect(() => {
    const checkAlerts = () => {
      const today = getTodayDayOfWeek();
      const nowMin = getMinutesNow();

      sessions.forEach((s) => {
        if (s.day !== today || s.completed) return;
        const startMin = parseTimeToMinutes(s.startTime);
        const diff = startMin - nowMin;

        // 30-min window check (between 15 and 30m)
        if (diff <= 30 && diff > 15) {
          if (notifications.enable30MinNotification && !notified30mRef.current.has(s.id)) {
            notified30mRef.current.add(s.id);

            // Send real phone notification to mobile status bar & notification shade
            sendInstantNotification({
              title: `📖 Fkerni : ${s.title || 'Étude'} dans 30 min`,
              body: `${ALERT_MESSAGES.notification30m} (${s.subject})`,
              type: '30m'
            });
          }
        }

        // 15-min alarm check (between 0 and 15m)
        if (diff <= 15 && diff >= 0) {
          if (notifications.enable15MinAlarm && !alarmed15mRef.current.has(s.id)) {
            alarmed15mRef.current.add(s.id);
            setAlarmModalData({
              isOpen: true,
              type: 'alarm_15m',
              session: s
            });

            // Send real phone alarm notification with sound & vibration
            sendInstantNotification({
              title: `📖 Fkerni : Alarme 15 min (${s.startTime})`,
              body: `${ALERT_MESSAGES.alarm15m} (${s.subject})`,
              type: '15m'
            });
          }
        }
      });
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, [sessions, notifications]);

  // 9. Actions
  const handleSaveNotes = (sessionId: string, notes: string) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const next = { ...s, notes };
        syncSessionToSupabase(next);
        return next;
      }
      return s;
    });
    setSessions(updated);
  };

  const handleToggleComplete = (sessionId: string) => {
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextState = !s.completed;
        const updatedObj = { ...s, completed: nextState };
        syncSessionToSupabase(updatedObj);
        return updatedObj;
      }
      return s;
    });
    setSessions(updated);
  };

  const handleDismissAlarm = () => {
    stopAlarm15m();
    setAlarmModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleManualRefresh = async () => {
    const fresh = await fetchSessionsFromSupabase();
    if (fresh && fresh.length > 0) {
      setSessions(fresh);
      setIsSupabaseLive(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Opening Intro message overlay */}
      <AnimatePresence>
        {showIntroOverlay && (
          <OpeningIntroOverlay
            quote={openingQuote}
            onEnterApp={() => {
              localStorage.setItem('fkerni_has_opened_before', 'true');
              setShowIntroOverlay(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Native Full-Screen Mobile Layout Container */}
      <div className="w-full max-w-lg min-h-screen mx-auto flex flex-col relative pb-28">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent pointer-events-none" />

        {/* Clean Header Bar with Real App Logo & Supabase Live Status */}
        <LiquidNavbar
          language={language}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSupabaseLive={isSupabaseLive}
          onRefresh={handleManualRefresh}
          onSecretTrigger={() => setIsSecretModalOpen(true)}
        />

        {/* App Main View */}
        <main className="flex-1 px-4 pt-3 z-10">
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-200">
              {/* Next upcoming session with live countdown */}
              <NextSessionCard
                sessions={sessions}
                language={language}
                onOpenSessionDetails={(session) => {
                  setEditingSession(session);
                  setIsSessionModalOpen(true);
                }}
              />

              {/* Weekly Schedule list with live countdowns */}
              <WeeklySchedule
                sessions={sessions}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                language={language}
                onOpenNotes={(session) => {
                  setEditingSession(session);
                  setIsSessionModalOpen(true);
                }}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-4 animate-in fade-in duration-200">
              <div className="rounded-3xl p-6 border border-white/[0.08] bg-[#0c111e] text-center shadow-lg">
                <img
                  src="/icon.png"
                  alt="Fkerni Logo"
                  className="w-16 h-16 mx-auto rounded-2xl object-cover border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-3"
                />
                <h4 className="text-base font-black text-white mb-1">
                  {language === 'ar' ? 'خيارات التطبيق' : language === 'en' ? 'App Settings' : 'Options de Fkerni'}
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  {language === 'ar'
                    ? 'تعديل لغة التطبيق وتنبيهات الإشعارات والمنبه'
                    : 'Gérer la langue, les alertes 30m et l’alarme 15m'}
                </p>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 active:scale-95 transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'فتح الإعدادات' : 'Ouvrir les Paramètres'}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Clean Floating Bottom Navigation - Elevated higher up */}
        <AndroidBottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          language={language}
        />
      </div>

      {/* Session Notes Modal */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
        onSaveNotes={handleSaveNotes}
        session={editingSession}
        language={language}
      />

      {/* Alarm Ringing Pop-up Modal */}
      <AlarmNotificationModal
        isOpen={alarmModalData.isOpen}
        type={alarmModalData.type}
        session={alarmModalData.session}
        language={language}
        onDismiss={handleDismissAlarm}
        onSnooze={handleDismissAlarm}
      />

      {/* Settings Drawer (Fast, lag-free hardware accelerated) */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onChangeLanguage={setLanguage}
        preferDerja={preferDerja}
        onToggleDerja={() => setPreferDerja(!preferDerja)}
        notifications={notifications}
        onUpdateNotifications={(newSettings) =>
          setNotifications((prev) => ({ ...prev, ...newSettings }))
        }
      />

      {/* Secret Love Modal (Triggered by 3 taps on the logo) */}
      <SecretLoveModal
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
        language={language}
      />
    </div>
  );
}
