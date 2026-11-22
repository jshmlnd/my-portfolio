import { createContext, useCallback, useContext, useRef, useEffect, useState } from 'react';

const AudioContextClass = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

let audioContext = null;
let masterGain = null;

const getAudioContext = () => {
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
};

const ensureAudioReady = async () => {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === 'suspended') {
    await context.resume();
  }
  return context;
};

const playTone = async (frequency, duration, type = 'sine', gainValue = 0.15) => {
  const context = await ensureAudioReady();
  // Don't schedule oscillators while context is suspended —
  // currentTime is frozen so they'd expire before playback starts.
  if (!context || context.state === 'suspended' || !masterGain) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

let noiseBuffer = null;
const getNoise = (context) => {
  if (!noiseBuffer) {
    const length = Math.floor(context.sampleRate * 0.03);
    noiseBuffer = context.createBuffer(1, length, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

let lastClickAt = -1;

// A soft tactile tick: a few ms of band-passed noise (the "switch") over a short
// sine that drops in pitch (the "body"). Scheduled on the audio clock, not setTimeout.
const playClickSound = async () => {
  const context = await ensureAudioReady();
  if (!context || context.state !== 'running' || !masterGain) return;

  const t = context.currentTime + 0.003;
  if (t - lastClickAt < 0.04) return; // one sound per click even if handlers double-fire
  lastClickAt = t;
  const pitch = 1 + (Math.random() - 0.5) * 0.08; // ±4% so repeated clicks don't sound mechanical

  const noise = context.createBufferSource();
  noise.buffer = getNoise(context);
  const band = context.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 3800 * pitch;
  band.Q.value = 1.2;
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.35, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
  noise.connect(band).connect(noiseGain).connect(masterGain);
  noise.start(t);
  noise.stop(t + 0.03);

  const body = context.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(1500 * pitch, t);
  body.frequency.exponentialRampToValueAtTime(600 * pitch, t + 0.04);
  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.0001, t);
  bodyGain.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  body.connect(bodyGain).connect(masterGain);
  body.start(t);
  body.stop(t + 0.07);
};


const playSuccessSound = async () => {
  await playTone(523.25, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 60);
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.12), 120);
};

const playErrorSound = async () => {
  await playTone(300, 0.15, 'sawtooth', 0.12);
  setTimeout(() => playTone(250, 0.15, 'sawtooth', 0.1), 80);
};

export const useSound = () => {
  const [enabled, setEnabled] = useState(() => {
    return typeof window === 'undefined' || !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  });
  const enabledRef = useRef(enabled);

  const enable = useCallback(() => {
    enabledRef.current = true;
    setEnabled(true);
  }, []);
  const disable = useCallback(() => {
    enabledRef.current = false;
    setEnabled(false);
  }, []);

  const playClick = useCallback(() => {
    if (enabledRef.current) playClickSound();
  }, []);


  const playSuccess = useCallback(() => {
    if (enabledRef.current) playSuccessSound();
  }, []);

  const playError = useCallback(() => {
    if (enabledRef.current) playErrorSound();
  }, []);

  return { enabled, playClick, playSuccess, playError, enable, disable };
};

export const SoundContext = createContext(null);

export const useSoundControls = () => useContext(SoundContext);

export const useSoundProvider = () => {
  const { enabled, playClick, playSuccess, playError, enable, disable } = useSound();

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], select, summary, .cursor-pointer');
      if (target) playClick();
    };

    document.addEventListener('click', handleClick, { passive: true });

    return () => document.removeEventListener('click', handleClick);
  }, [playClick]);

  return { enabled, playSuccess, playError, enable, disable };
};
