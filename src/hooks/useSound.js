import { useCallback, useRef, useEffect } from 'react';

const AudioContext = window.AudioContext || window.webkitAudioContext;

// Create AudioContext eagerly on module load (startup)
// It will be in 'suspended' state until user interaction resumes it
let audioContext = new AudioContext();
let masterGain = audioContext.createGain();
masterGain.gain.value = 0.15;
masterGain.connect(audioContext.destination);

const ensureAudioReady = async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

const playTone = async (frequency, duration, type = 'sine', gainValue = 0.15) => {
  await ensureAudioReady();
  // Don't schedule oscillators while context is suspended —
  // currentTime is frozen so they'd expire before playback starts.
  if (!audioContext || audioContext.state === 'suspended') return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
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
  const enabledRef = useRef(true);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

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
      // AudioContext already created on startup, just resume it
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }
      await playTone(880, 0.08, 'sine', 0.15);
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

  return { playClick, playSuccess, playError, enable, disable };
};

export const useSoundProvider = () => {
  const { playClick, playSuccess, playError, enable, disable } = useSound();

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], select, summary, .cursor-pointer');
      if (target) playClick();
    };

    document.addEventListener('click', handleClick, { passive: true });

    return () => document.removeEventListener('click', handleClick);
  }, [playClick]);

  return { playSuccess, playError, enable, disable };
};