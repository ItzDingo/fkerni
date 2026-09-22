// Web Audio API Synthesizer for Fkerni
let audioCtx: AudioContext | null = null;
let alarmIntervalId: number | null = null;
let isAlarmActive = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTypewriterSound(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // subtle pitch variation
    const freq = 1200 + Math.random() * 400;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // ignore audio block
  }
}

export function playNotification30mSound(volume = 80): void {
  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Two pleasant ascending chimes (E5, B5)
    const tones = [659.25, 987.77];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.18;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

export function startAlarm15m(volume = 90, onTick?: () => void): () => void {
  stopAlarm15m();
  isAlarmActive = true;

  const playChimeBurst = () => {
    if (!isAlarmActive) return;
    try {
      const ctx = getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volume / 100) * 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // 4-tone energetic alert sequence (A5 -> C#6 -> E6 -> A6)
      const frequencies = [880, 1108.73, 1318.51, 1760];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const startTime = ctx.currentTime + index * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      onTick?.();
    } catch (err) {
      console.warn('Alarm audio error:', err);
    }
  };

  playChimeBurst();
  // repeat every 2.4 seconds until stopped
  alarmIntervalId = window.setInterval(playChimeBurst, 2400);

  return stopAlarm15m;
}

export function stopAlarm15m(): void {
  isAlarmActive = false;
  if (alarmIntervalId !== null) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

export function isAlarmPlaying(): boolean {
  return isAlarmActive;
}
