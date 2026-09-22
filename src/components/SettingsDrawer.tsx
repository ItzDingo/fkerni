import React from 'react';
import {
  X,
  Bell,
  Languages,
  Database,
  CheckCircle2
} from 'lucide-react';
import { AppLanguage, NotificationSettings } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  preferDerja: boolean;
  onToggleDerja: () => void;
  notifications: NotificationSettings;
  onUpdateNotifications: (newSettings: Partial<NotificationSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
  preferDerja,
  onToggleDerja,
  notifications,
  onUpdateNotifications
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150">
      {/* Dim backdrop without heavy blur for maximum rendering performance */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 cursor-pointer"
      />

      {/* Slide-in drawer with hardware-accelerated CSS translate (0 JS spring lag) */}
      <div
        className="relative w-full max-w-md h-full overflow-y-auto bg-[#0a0e18] border-l border-white/[0.08] p-5 text-slate-100 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        style={{ willChange: 'transform' }}
      >
        {/* Main content */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="Fkerni Logo"
                className="w-9 h-9 rounded-xl object-cover border border-cyan-400/30 shadow-md shadow-cyan-950/40"
              />
              <div>
                <h3 className="text-base font-black text-white">
                  {language === 'ar' ? 'إعدادات فكّرني' : language === 'en' ? 'Fkerni Settings' : 'Paramètres Fkerni'}
                </h3>
                <span className="text-[11px] text-slate-400">Options & Notifications</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Supabase Live Status Card */}
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  Supabase Live Sync
                </span>
                <span className="text-[10px] text-emerald-400/80">
                  Connecté à la table <span className="font-mono font-bold">sessions</span>
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              En direct
            </span>
          </div>

          {/* 1. Language Section */}
          <div className="mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'لغة التطبيق' : language === 'en' ? 'App Language' : 'Langue de l’application'}</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fr', label: 'Français 🇫🇷' },
                { id: 'en', label: 'English 🇬🇧' },
                { id: 'ar', label: 'العربية 🇹🇳' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeLanguage(item.id as AppLanguage)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    language === item.id
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-sm'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Tounsi Derja toggle */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Citations Tounsi (تونسي دارجة)
                </span>
                <span className="text-[10px] text-slate-400">
                  Phrases sarcastiques et motivantes tunisiennes
                </span>
              </div>
              <button
                onClick={onToggleDerja}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  preferDerja ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    preferDerja ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Notifications & Alarm Options */}
          <div className="mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'التنبيهات والمنبه' : language === 'en' ? 'Alerts & Alarm Options' : 'Alertes & Options d’Alarme'}</span>
            </label>

            {/* Toggle 30m Notification */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {language === 'ar' ? 'إشعار قبل 30 دقيقة' : language === 'en' ? '30-minute Notification' : 'Notification 30 minutes avant'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'إشعار على شاشة الهاتف' : 'Alerte dans le volet de notification du téléphone'}
                </span>
              </div>
              <button
                onClick={() => onUpdateNotifications({ enable30MinNotification: !notifications.enable30MinNotification })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.enable30MinNotification ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.enable30MinNotification ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 15m Alarm */}
            <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {language === 'ar' ? 'منبه رنان قبل 15 دقيقة' : language === 'en' ? '15-minute Loud Alarm' : 'Alarme sonnante 15 minutes avant'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'منبه صوتي واهتزاز يظهر فوق التطبيقات' : 'Sonnerie + vibration prioritaire sur le téléphone'}
                </span>
              </div>
              <button
                onClick={() => onUpdateNotifications({ enable15MinAlarm: !notifications.enable15MinAlarm })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.enable15MinAlarm ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.enable15MinAlarm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {language === 'ar' ? 'الاهتزاز (Vibration)' : language === 'en' ? 'Vibration' : 'Vibrations du téléphone'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Faire vibrer le téléphone lors de l'alarme
                </span>
              </div>
              <button
                onClick={() => onUpdateNotifications({ vibration: !notifications.vibration })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notifications.vibration ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.vibration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-4 border-t border-white/[0.08] text-center text-xs font-medium text-slate-500">
          Fkerni • Version v1.1 • Made For Mallouka ❤️
        </div>
      </div>
    </div>
  );
};
