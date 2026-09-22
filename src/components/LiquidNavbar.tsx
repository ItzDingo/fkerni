import React, { useState, useEffect, useRef } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { AppLanguage } from '../types';
import { DAY_LABELS, getTodayDayOfWeek } from '../utils/timeUtils';

interface LiquidNavbarProps {
  language: AppLanguage;
  onOpenSettings: () => void;
  hasUnreadAlert?: boolean;
  isSupabaseLive?: boolean;
  onRefresh?: () => void;
  onSecretTrigger?: () => void;
}

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  language,
  onOpenSettings,
  hasUnreadAlert,
  isSupabaseLive = true,
  onRefresh,
  onSecretTrigger
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const today = getTodayDayOfWeek();
      const dayLabel = DAY_LABELS[today][language];
      const dayNum = now.getDate();
      const monthNames = {
        fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ar: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      };
      const monthName = monthNames[language][now.getMonth()];
      setCurrentDateStr(`${dayLabel} ${dayNum} ${monthName}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, [language]);

  // Triple-click detection on the logo to trigger secret Easter egg
  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onSecretTrigger?.();
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full select-none safe-header px-3.5 pb-2 bg-[#070a11]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between gap-3 h-14">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src="/icon.png"
              alt="Fkerni Logo"
              onClick={handleLogoClick}
              title="Fkerni"
              className="w-10 h-10 rounded-2xl object-cover border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-transform active:scale-90 cursor-pointer"
            />
            {isSupabaseLive && (
              <span
                title="Données synchronisées en direct avec Supabase"
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070a11] shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none"
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center leading-none">
                <span>Fkerni</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/25 uppercase tracking-wider">
                BAC
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 capitalize mt-1 leading-none">
              {currentDateStr}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Actualiser les données"
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title={language === 'ar' ? 'الإعدادات' : 'Paramètres'}
            className="relative p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Settings className="w-4 h-4" />
            {hasUnreadAlert && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-ping" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
