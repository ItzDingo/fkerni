import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppLanguage } from '../types';

interface SecretLoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: AppLanguage;
}

export const SecretLoveModal: React.FC<SecretLoveModalProps> = ({
  isOpen,
  onClose,
  language = 'fr'
}) => {
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReplyMessage(null);
      // Trigger romantic colorful confetti burst
      try {
        confetti({
          particleCount: 75,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#38bdf8']
        });
      } catch {
        // ignore if canvas-confetti fails
      }
    } else {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      setReplyMessage(null);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [isOpen]);

  const handleNkrhkClick = () => {
    setReplyMessage('Wena N7ebk 😊');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fb7185']
      });
    } catch {
      // ignore
    }

    // Auto-close after exactly 3 seconds
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = window.setTimeout(() => {
      onClose();
      setReplyMessage(null);
    }, 3000);
  };

  const getFermerLabel = (lang: AppLanguage) => {
    if (lang === 'ar') return 'إغلاق';
    if (lang === 'en') return 'Close';
    return 'Fermer';
  };

  const getAutoCloseLabel = (lang: AppLanguage) => {
    if (lang === 'ar') return 'إغلاق تلقائي خلال 3 ثوانٍ...';
    if (lang === 'en') return 'Auto-closing in 3s...';
    return 'Fermeture automatique dans 3s...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Dark backdrop with subtle rose glow */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 cursor-pointer"
      />

      {/* Main Love Card */}
      <div
        className="relative w-full max-w-sm rounded-[36px] p-6 sm:p-7 border border-rose-500/30 bg-gradient-to-b from-[#180a12] via-[#0f070c] to-[#070508] shadow-[0_25px_60px_rgba(244,63,94,0.35)] text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Top ambient highlight */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-rose-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Beating Heart */}
        <div className="my-2.5 flex items-center justify-center">
          <div className="relative">
            <span className="text-7xl sm:text-8xl select-none inline-block animate-pulse drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]">
              ❤️
            </span>
          </div>
        </div>

        {/* Secret Message Requested by User */}
        <div className="mt-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/15 border border-rose-400/30 text-rose-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Message Secret</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Nchallh bel nje7 ya rohy
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-rose-200/90 mt-2.5 leading-relaxed px-1">
            Dima m3ak w dima nchajja3 fik w 3ndi keml el thi9a eli mentions bel sehl nchallh
          </p>
        </div>

        {/* Response Box when 'Nkrhk' is clicked */}
        {replyMessage ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-center animate-in zoom-in-95 duration-200">
            <p className="text-lg font-black text-rose-200 tracking-wide flex items-center justify-center gap-2">
              <span>{replyMessage}</span>
            </p>
            <span className="text-[10px] text-rose-300/75 block mt-1">
              {getAutoCloseLabel(language)}
            </span>
          </div>
        ) : (
          /* Two Action Buttons: Fermer & Nkrhk */
          <div className="pt-4 grid grid-cols-2 gap-2.5">
            {/* Button 1: Fermer (translates with language) */}
            <button
              onClick={onClose}
              className="py-3 px-3 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 hover:text-white font-extrabold text-xs border border-white/[0.1] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {getFermerLabel(language)}
            </button>

            {/* Button 2: Nkrhk (fixed, replies "Wena N7ebk 😊" and closes after 3s) */}
            <button
              onClick={handleNkrhkClick}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-rose-950/50 transition-all active:scale-95 cursor-pointer"
            >
              Nkrhk
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
