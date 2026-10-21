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

const playClickSound = async () => {
  await playTone(800, 0.08, 'square', 0.12);
  setTimeout(() => playTone(600, 0.06, 'square', 0.08), 30);
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

  useEffect(() => {
    let initialized = false;

    const handleInteraction = async () => {
      if (initialized) return;
      initialized = true;
      if (enabledRef.current) await playTone(880, 0.08, 'sine', 0.15);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    // Only click/keydown for confirmation tone - play functions handle resume themselves
    document.addEventListener('click', handleInteraction, { once: true, passive: true });
    document.addEventListener('keydown', handleInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
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
