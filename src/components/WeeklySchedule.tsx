import React, { useState, useEffect, useMemo } from 'react';
import { Check, Clock, FileText, CheckCircle, BookOpen, Timer } from 'lucide-react';
import { StudySession, DayOfWeek, AppLanguage, SessionColor } from '../types';
import { DAYS_ORDER, DAY_LABELS, getSessionStatus, parseTimeToMinutes, getSessionLiveCountdown } from '../utils/timeUtils';

interface WeeklyScheduleProps {
  sessions: StudySession[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  language: AppLanguage;
  onOpenNotes: (session: StudySession) => void;
  onToggleComplete: (sessionId: string) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  sessions,
  selectedDay,
  onSelectDay,
  language,
  onOpenNotes,
  onToggleComplete
}) => {
  // Update ticker every second for accurate countdowns
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDaySessions = useMemo(() => {
    return sessions
      .filter((s) => s.day === selectedDay)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
  }, [sessions, selectedDay]);

  const getColorClasses = (color: SessionColor) => {
    switch (color) {
      case 'cyan':
        return {
          chip: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
          accent: 'border-l-cyan-400'
        };
      case 'indigo':
        return {
          chip: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
          accent: 'border-l-indigo-400'
        };
      case 'purple':
        return {
          chip: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
          accent: 'border-l-purple-400'
        };
      case 'emerald':
        return {
          chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
          accent: 'border-l-emerald-400'
        };
      case 'amber':
        return {
          chip: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
          accent: 'border-l-amber-400'
        };
      case 'rose':
        return {
          chip: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
          accent: 'border-l-rose-400'
        };
      case 'orange':
        return {
          chip: 'bg-orange-500/15 text-orange-300 border-orange-400/30',
          accent: 'border-l-orange-400'
        };
      case 'teal':
        return {
          chip: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
          accent: 'border-l-teal-400'
        };
      case 'sky':
        return {
          chip: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
          accent: 'border-l-sky-400'
        };
      case 'silver':
        return {
          chip: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
          accent: 'border-l-slate-400'
        };
      case 'blue':
      default:
        return {
          chip: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
          accent: 'border-l-blue-400'
        };
    }
  };

  const getStatusBadge = (session: StudySession, isPassed: boolean, isInProgress: boolean) => {
    if (session.completed) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          {language === 'ar' ? 'مكتملة' : language === 'en' ? 'Done' : 'Terminé'}
        </span>
      );
    }

    if (isInProgress) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          {language === 'ar' ? 'جارية الآن' : language === 'en' ? 'In Progress' : 'En cours'}
        </span>
      );
    }

    if (isPassed) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/[0.06]">
          <Check className="w-3 h-3" />
          {language === 'ar' ? 'فاتت' : language === 'en' ? 'Passed' : 'Passée'}
        </span>
      );
    }

    const status = getSessionStatus(session);
    if (status === 'upcoming_soon_15') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <BookOpen className="w-3 h-3" />
          {language === 'ar' ? 'خلال 15 د' : language === 'en' ? 'In 15m' : 'Dans 15 min'}
        </span>
      );
    }

    if (status === 'upcoming_soon_30') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
          <Clock className="w-3 h-3" />
          {language === 'ar' ? 'خلال 30 د' : language === 'en' ? 'In 30m' : 'Dans 30 min'}
        </span>
      );
    }

    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
        {language === 'ar' ? 'قادمة' : language === 'en' ? 'Upcoming' : 'À venir'}
      </span>
    );
  };

  return (
    <section id="fkerni-weekly-schedule" className="mb-20">
      {/* Day Selector Header */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {language === 'ar' ? 'جدول الأسبوع' : language === 'en' ? 'Weekly Schedule' : 'Emploi du temps'}
        </h3>
        <span className="text-[11px] font-medium text-slate-500">
          {currentDaySessions.length} {language === 'ar' ? 'حصص' : 'séances'}
        </span>
      </div>

      {/* Horizontal Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {DAYS_ORDER.map((day) => {
          const isSelected = day === selectedDay;
          const count = sessions.filter((s) => s.day === day).length;
          const dayLabel = DAY_LABELS[day];

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`flex-1 min-w-[46px] py-2 px-1 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/10 border-cyan-400/50 text-white shadow-md shadow-cyan-950/40'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[11px] font-extrabold uppercase">
                {language === 'ar' ? dayLabel.shortAr : language === 'en' ? dayLabel.shortEn : dayLabel.shortFr}
              </span>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  isSelected
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : count > 0
                    ? 'bg-white/10 text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sessions List */}
      <div className="space-y-2.5">
        {currentDaySessions.length === 0 ? (
          <div className="rounded-3xl p-6 border border-white/[0.06] bg-[#0c111d] text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              {language === 'ar'
                ? 'ما فماش حصص دراسة مسجلة لهذا اليوم'
                : language === 'en'
                ? 'No study sessions scheduled for this day'
                : 'Aucune séance d’étude programmée pour ce jour'}
            </p>
          </div>
        ) : (
          currentDaySessions.map((session) => {
            const countdown = getSessionLiveCountdown(session, language);
            const isPassed = countdown.isPassed || !!session.completed;
            const style = getColorClasses(session.color);

            return (
              <div
                key={session.id}
                className={`group relative overflow-hidden rounded-3xl p-4 border border-l-4 transition-all shadow-md active:scale-[0.99] ${
                  style.accent
                } ${
                  isPassed
                    ? 'border-white/[0.04] bg-[#090d16]/60 opacity-60'
                    : 'border-white/[0.08] bg-[#0d121f] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onOpenNotes(session)}
                  >
                    {/* Header Chips */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {getStatusBadge(session, isPassed, countdown.isInProgress)}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.chip}`}>
                        {session.title || 'Étude'}
                      </span>
                    </div>

                    {/* Session Title & Subject */}
                    <h4
                      className={`text-base font-extrabold tracking-tight text-white flex items-center gap-2 ${
                        isPassed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {language === 'ar'
                        ? `قراية مع ${session.startTime}`
                        : language === 'en'
                        ? `Study at ${session.startTime}`
                        : `Étude à ${session.startTime}`}
                    </h4>

                    <p className="text-xs font-semibold text-slate-300 mt-0.5">{session.subject}</p>

                    {/* Time Window */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>

                    {/* Live Countdown Snippet */}
                    {!isPassed && (
                      <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <Timer className="w-3 h-3 text-cyan-400" />
                          {countdown.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {countdown.formatted}
                        </span>
                      </div>
                    )}

                    {/* Notes Snippet */}
                    {session.notes ? (
                      <p className="text-xs text-slate-300 mt-2 italic bg-black/40 p-2 rounded-xl border border-white/[0.06] flex items-start gap-1.5">
                        <FileText className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">"{session.notes}"</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Ajouter une note...</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(session.id);
                      }}
                      title={session.completed ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                      className={`p-2.5 rounded-2xl border transition-all active:scale-90 cursor-pointer ${
                        session.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                          : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-400 hover:text-white border-white/[0.08]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNotes(session);
                      }}
                      title="Ajouter ou modifier vos notes"
                      className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-400 hover:text-cyan-300 border border-white/[0.08] transition-all active:scale-90 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
