import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { playTypewriterSound } from '../utils/audio';

interface OpeningIntroOverlayProps {
  quote: { text: string; emoji: string };
  onEnterApp: () => void;
}

export const OpeningIntroOverlay: React.FC<OpeningIntroOverlayProps> = ({
  quote,
  onEnterApp
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const displayText = quote.text;

  // Smooth letter-by-letter typing animation with throttled sound
  useEffect(() => {
    setDisplayedLength(0);
    setIsFinished(false);

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedLength(index);

      // Play soft typewriter tick only on space or every 4th character to protect mobile audio thread
      if (index % 4 === 0 || displayText[index - 1] === ' ') {
        playTypewriterSound();
      }

      if (index >= displayText.length) {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 32);

    return () => clearInterval(interval);
  }, [displayText]);

  const handleSkipOrEnter = () => {
    if (!isFinished) {
      setDisplayedLength(displayText.length);
      setIsFinished(true);
    } else {
      onEnterApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070c]/95 backdrop-blur-xl select-none animate-in fade-in duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-sm rounded-[32px] p-6 border border-white/[0.12] bg-[#0c121e]/90 shadow-2xl overflow-hidden text-center">
        {/* Specular line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* App Logo & Badge */}
        <div className="flex flex-col items-center justify-center mb-4">
          <img
            src="/icon.png"
            alt="Fkerni Logo"
            className="w-14 h-14 rounded-2xl object-cover border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-3"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fkerni</span>
          </div>
        </div>

        {/* Emoji */}
        <div className="text-4xl mb-3 select-none">
          {quote.emoji || '🔥'}
        </div>

        {/* Typed message container */}
        <div className="min-h-[90px] flex flex-col items-center justify-center mb-6 px-1">
          <p className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            {displayText.slice(0, displayedLength)}
            {!isFinished && (
              <span className="inline-block w-2 h-5 ml-1 bg-cyan-400 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {isFinished ? (
            <button
              onClick={onEnterApp}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Continuer vers l'emploi du temps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSkipOrEnter}
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold text-xs border border-white/[0.08] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>Passer</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
