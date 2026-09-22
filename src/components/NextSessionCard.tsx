import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';
import { StudySession, AppLanguage } from '../types';
import { getNextUpcomingSession, formatDuration, DAY_LABELS, parseTimeToMinutes, getMinutesNow } from '../utils/timeUtils';

interface NextSessionCardProps {
  sessions: StudySession[];
  language: AppLanguage;
  onOpenSessionDetails?: (session: StudySession) => void;
}

export const NextSessionCard: React.FC<NextSessionCardProps> = ({
  sessions,
  language,
  onOpenSessionDetails
}) => {
  const [, setTicker] = useState(0);

  // Update countdown live every single second
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Evaluated live on every second tick
  const nextData = getNextUpcomingSession(sessions);

  const getLabelEtude = (time: string) => {
    if (language === 'ar') return `قراية مع ${time}`;
    if (language === 'en') return `Study at ${time}`;
    return `Étude à ${time}`;
  };

  if (!nextData) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-5 mb-4 border border-white/[0.08] bg-[#0c111d] text-center shadow-lg">
        <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
          <Calendar className="w-5 h-5 text-cyan-400" />
        </div>
        <p className="text-sm font-bold text-slate-200">
          {language === 'ar' ? 'ما فماش حصص دراسة مسجلة' : language === 'en' ? 'No study sessions scheduled' : 'Aucune séance d’étude programmée'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'ar' ? 'الجدول جاهز ومنظم' : language === 'en' ? 'Schedules are all set' : 'Votre emploi du temps est prêt'}
        </p>
      </div>
    );
  }

  const { session, isCurrent, secondsRemaining } = nextData;
  const dayLabel = DAY_LABELS[session.day][language];

  // Calculate progress percentage if session is currently active
  let progressPercent = 0;
  if (isCurrent) {
    const startM = parseTimeToMinutes(session.startTime);
    const endM = parseTimeToMinutes(session.endTime);
    const totalDuration = (endM - startM) * 60;
    const elapsed = (getMinutesNow() - startM) * 60;
    progressPercent = Math.min(100, Math.max(0, (elapsed / (totalDuration || 1)) * 100));
  }

  return (
    <div
      id="fkerni-next-session-card"
      onClick={() => onOpenSessionDetails?.(session)}
      className={`relative overflow-hidden rounded-3xl p-5 mb-4 border transition-all shadow-xl cursor-pointer ${
        isCurrent
          ? 'border-cyan-500/40 bg-gradient-to-b from-[#0c192d] via-[#09111f] to-[#070b14]'
          : 'border-white/[0.08] bg-gradient-to-b from-[#0e1422] to-[#080c14]'
      }`}
    >
      {/* Top subtle ambient highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isCurrent ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {language === 'ar' ? 'حصة جارية الآن' : language === 'en' ? 'Session In Progress' : 'Séance en cours'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/[0.06] text-slate-200 border border-white/[0.1]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {language === 'ar' ? 'الحصة القادمة' : language === 'en' ? 'Upcoming Session' : 'Prochaine Séance'}
            </span>
          )}
          <span className="text-xs text-slate-400 font-semibold">({dayLabel})</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-300 font-mono bg-white/[0.05] px-2.5 py-1 rounded-xl border border-white/[0.06]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{session.startTime} - {session.endTime}</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-3.5">
        <h2 className="text-2xl font-black tracking-tight text-white">
          {getLabelEtude(session.startTime)}
        </h2>
        <p className="text-sm font-semibold text-cyan-400 mt-0.5">
          {session.subject}
        </p>
      </div>

      {/* Live Countdown Display */}
      <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-black/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isCurrent
              ? (language === 'ar' ? 'الوقت المتبقي لانتهاء الحصة' : language === 'en' ? 'Time Remaining' : 'Fin de la séance dans')
              : (language === 'ar' ? 'العد التنازلي للبداية' : language === 'en' ? 'Countdown to Start' : 'Début dans')}
          </span>
          <span className="text-2xl font-mono font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {formatDuration(secondsRemaining)}
            </span>
          </span>
        </div>
      </div>

      {/* Progress Bar (if in progress) */}
      {isCurrent && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-linear"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>{session.startTime}</span>
            <span>{Math.round(progressPercent)}% terminé</span>
            <span>{session.endTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};
