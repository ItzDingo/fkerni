import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, BookOpen, FileText, Check } from 'lucide-react';
import { StudySession, AppLanguage } from '../types';
import { DAY_LABELS } from '../utils/timeUtils';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNotes: (sessionId: string, notes: string) => void;
  session?: StudySession | null;
  language: AppLanguage;
}

export const SessionModal: React.FC<SessionNotesModalProps> = ({
  isOpen,
  onClose,
  onSaveNotes,
  session,
  language
}) => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (session) {
      setNotes(session.notes || '');
      setIsSaved(false);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const dayLabel = DAY_LABELS[session.day];
  const dayName =
    language === 'ar' ? dayLabel.ar : language === 'en' ? dayLabel.en : dayLabel.fr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNotes(session.id, notes.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Backdrop without blur to ensure 60fps performance */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 cursor-pointer"
      />

      {/* Modal Dialog with hardware-accelerated CSS animations */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/[0.12] bg-[#0c101a] p-5 shadow-2xl text-left overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Top subtle highlight */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {language === 'ar'
                  ? 'ملاحظات الحصة'
                  : language === 'en'
                  ? 'Session Notes'
                  : 'Notes de la séance'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? 'سجلي واجباتك وملاحظات المراجعة الخاصة بك'
                  : language === 'en'
                  ? 'Add personal homework and study notes'
                  : 'Ajoute tes devoirs et rappels de révision'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-Only Schedule Details */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{session.subject}</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
              {session.title || 'Étude'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-300">{dayName}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>
          </div>
        </div>

        {/* Form for Notes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>
                {language === 'ar'
                  ? 'الملاحظات والواجبات:'
                  : language === 'en'
                  ? 'Notes & Homework:'
                  : 'Mes devoirs & notes de cours :'}
              </span>
              <span className="text-[10px] text-slate-500">
                {notes.length} caractères
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={
                language === 'ar'
                  ? 'مثال: تمارين صفحة 42، مراجعة الدرس 3، تلخيص القواعد...'
                  : language === 'en'
                  ? 'e.g. Exercises page 42, review chapter 3, formulas...'
                  : 'Ex : Exercices page 42, réviser le résumé de cours, préparer le contrôle...'
              }
              className="w-full px-3.5 py-3 rounded-2xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold border border-white/[0.06] transition-all active:scale-95 cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : language === 'en' ? 'Cancel' : 'Fermer'}
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-cyan-950/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isSaved
                  ? (language === 'ar' ? 'تم الحفظ !' : 'Enregistré !')
                  : (language === 'ar' ? 'حفظ الملاحظة' : language === 'en' ? 'Save Notes' : 'Enregistrer')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
