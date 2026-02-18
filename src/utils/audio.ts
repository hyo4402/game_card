const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSound = (type: 'click' | 'coin' | 'win' | 'lose') => {
  if (localStorage.getItem('sound_enabled') === 'false') return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  switch (type) {
    case 'click':
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'coin':
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'win':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'lose':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
  }
};

export const vibrate = (pattern: number | number[] = 10) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

export const triggerConfetti = () => {
  const c = (window as any).confetti;
  if (c) c({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};