import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { StudySession, AppLanguage } from '../types';
import { ALERT_MESSAGES } from '../config/customContent';

interface AlarmNotificationModalProps {
  isOpen: boolean;
  type: 'alarm_15m' | 'notification_30m';
  session: StudySession | null;
  language: AppLanguage;
  onDismiss: () => void;
  onSnooze?: () => void;
}

export const AlarmNotificationModal: React.FC<AlarmNotificationModalProps> = ({
  isOpen,
  type,
  session,
  language,
  onDismiss,
  onSnooze
}) => {
  if (!isOpen || !session) return null;

  const is15mAlarm = type === 'alarm_15m';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm rounded-[32px] p-6 border shadow-2xl overflow-hidden text-center backdrop-blur-xl ${
          is15mAlarm
            ? 'border-cyan-500/50 bg-[#091120]/95 shadow-[0_20px_50px_rgba(6,182,212,0.25)]'
            : 'border-cyan-400/40 bg-[#080e1a]/95 shadow-[0_20px_50px_rgba(6,182,212,0.2)]'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Brand Book Icon */}
        <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
          {is15mAlarm && (
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
          )}
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center border shadow-xl bg-cyan-500/15 text-cyan-400 border-cyan-400/40">
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 border bg-cyan-500/15 text-cyan-300 border-cyan-400/30">
          <BookOpen className="w-3.5 h-3.5" />
          {is15mAlarm
            ? (language === 'ar' ? 'منبه 15 دقيقة' : language === 'en' ? '15 MIN ALARM' : 'ALARME 15 MIN')
            : (language === 'ar' ? 'تذكير 30 دقيقة' : language === 'en' ? '30 MIN REMINDER' : 'RAPPEL 30 MIN')}
        </span>

        {/* Session Title */}
        <h2 className="text-2xl font-black text-white tracking-tight mt-1 mb-1">
          {language === 'ar'
            ? `قراية مع ${session.startTime}`
            : language === 'en'
            ? `Study at ${session.startTime}`
            : `Étude à ${session.startTime}`}
        </h2>

        <p className="text-base font-bold text-cyan-300">{session.subject}</p>

        {/* Custom Message */}
        <div className="my-4 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 text-xs sm:text-sm font-semibold text-slate-100">
          {is15mAlarm ? ALERT_MESSAGES.alarm15m : ALERT_MESSAGES.notification30m}
        </div>

        {/* Hours */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-5 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{session.startTime} - {session.endTime}</span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-2xl font-extrabold text-sm tracking-wide text-white transition-all active:scale-95 shadow-xl cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 shadow-blue-950/60"
          >
            {is15mAlarm
              ? (language === 'ar' ? 'إيقاف المنبه (قوم أقرى)' : language === 'en' ? 'Stop Alarm & Study' : 'Arrêter l’alarme & Étudier')
              : (language === 'ar' ? 'فهمت، حاضر' : language === 'en' ? 'Understood' : 'C’est noté')}
          </button>

          {is15mAlarm && onSnooze && (
            <button
              onClick={onSnooze}
              className="w-full py-2.5 rounded-2xl font-semibold text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'فكرني بعد 5 دقائق (Snooze)' : language === 'en' ? 'Snooze 5 mins' : 'Répéter dans 5 minutes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
