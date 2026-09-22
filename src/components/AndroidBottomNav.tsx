import React from 'react';
import { Calendar, Settings, Sparkles } from 'lucide-react';
import { AppLanguage } from '../types';

export type ActiveTab = 'schedule' | 'settings';

interface AndroidBottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onChangeTab,
  language
}) => {
  const tabs: { id: ActiveTab; labelFr: string; labelEn: string; labelAr: string; icon: typeof Calendar }[] = [
    { id: 'schedule', labelFr: 'Planning', labelEn: 'Schedule', labelAr: 'الجدول', icon: Calendar },
    { id: 'settings', labelFr: 'Paramètres', labelEn: 'Settings', labelAr: 'الإعدادات', icon: Settings }
  ];

  return (
    <nav className="fixed safe-bottom-nav inset-x-0 z-40 select-none pointer-events-none px-4">
      <div className="mx-auto max-w-xs sm:max-w-sm rounded-3xl border border-white/[0.12] bg-[#090d16]/95 backdrop-blur-xl p-1.5 flex items-center justify-around shadow-[0_12px_36px_rgba(0,0,0,0.85)] pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = language === 'ar' ? tab.labelAr : language === 'en' ? tab.labelEn : tab.labelFr;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-2 px-3 flex flex-col items-center gap-1 rounded-2xl transition-all relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-cyan-400 bg-white/[0.06] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-400 mt-0.5' : 'mt-0.5'}`} />
              <span className="text-[11px] tracking-tight leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
