import React from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { StudySession, AppLanguage } from '../types';

interface DynamicAlertBannerProps {
  alert: {
    type: 'alarm_15m' | 'notification_30m';
    session: StudySession;
    message: string;
  } | null;
  language: AppLanguage;
  onDismiss: () => void;
  onOpenDetails: (session: StudySession) => void;
}

export const DynamicAlertBanner: React.FC<DynamicAlertBannerProps> = ({
  alert,
  language,
  onDismiss,
  onOpenDetails
}) => {
  if (!alert) return null;

  const is15m = alert.type === 'alarm_15m';

  return (
    <aside
      aria-label="Alert Banner"
      className="fixed top-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[410px] z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div
        onClick={() => onOpenDetails(alert.session)}
        className={`relative overflow-hidden rounded-[24px] p-3.5 border shadow-2xl backdrop-blur-xl cursor-pointer select-none transition-all active:scale-[0.98] ${
          is15m
            ? 'border-rose-500/40 bg-[#12080d]/95 shadow-[0_12px_36px_rgba(244,63,94,0.3)]'
            : 'border-cyan-400/40 bg-[#070e1a]/95 shadow-[0_12px_36px_rgba(6,182,212,0.3)]'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Header: Real App Icon + App Name */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <img
              src="/icon.png"
              alt="Fkerni"
              className="w-5 h-5 rounded-md object-cover border border-white/20"
            />
            <span className="text-xs font-black tracking-tight text-white">Fkerni</span>
            <span className="text-[10px] text-slate-500">•</span>
            <span className="text-[10px] font-medium text-slate-400">
              {language === 'ar' ? 'الآن' : language === 'en' ? 'Now' : 'Maintenant'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fermer la notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
              is15m
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
            }`}
          >
            {is15m ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white">
                {language === 'ar'
                  ? `قراية مع ${alert.session.startTime}`
                  : `Étude à ${alert.session.startTime}`}
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  is15m
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30'
                }`}
              >
                {is15m ? 'Dans 15 min 🚨' : 'Dans 30 min ⏰'}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-semibold truncate mt-0.5">
              {alert.session.subject}
            </p>

            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
              {alert.message}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
