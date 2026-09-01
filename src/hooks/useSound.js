import { useCallback, useRef, useEffect } from 'react';

const AudioContext = window.AudioContext || window.webkitAudioContext;

let audioContext = null;
let masterGain = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

const playTone = (frequency, duration, type = 'sine', gainValue = 0.15) => {
  initAudio();
  if (!audioContext) return;

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

const playClickSound = () => {
  playTone(800, 0.08, 'square', 0.12);
  setTimeout(() => playTone(600, 0.06, 'square', 0.08), 30);
};

const playHoverSound = () => {
  playTone(1200, 0.04, 'sine', 0.06);
};

const playSuccessSound = () => {
  playTone(523.25, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 60);
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.12), 120);
};

const playErrorSound = () => {
  playTone(300, 0.15, 'sawtooth', 0.12);
  setTimeout(() => playTone(250, 0.15, 'sawtooth', 0.1), 80);
};

export const useSound = () => {
  const hoverPlayedRef = useRef(new Set());
  const enabledRef = useRef(true);

  const enable = useCallback(() => { enabledRef.current = true; }, []);
  const disable = useCallback(() => { enabledRef.current = false; }, []);

  const playClick = useCallback(() => {
    if (enabledRef.current) playClickSound();
  }, []);

  const playHover = useCallback((elementId) => {
    if (!enabledRef.current) return;
    if (hoverPlayedRef.current.has(elementId)) return;
    hoverPlayedRef.current.add(elementId);
    playHoverSound();
    setTimeout(() => hoverPlayedRef.current.delete(elementId), 300);
  }, []);

  const playSuccess = useCallback(() => {
    if (enabledRef.current) playSuccessSound();
  }, []);

  const playError = useCallback(() => {
    if (enabledRef.current) playErrorSound();
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    document.addEventListener('click', handleInteraction, { once: true, passive: true });
    document.addEventListener('keydown', handleInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return { playClick, playHover, playSuccess, playError, enable, disable };
};

export const useSoundProvider = () => {
  const { playClick, playHover, playSuccess, playError, enable, disable } = useSound();

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], select, summary, .cursor-pointer');
      if (target) playClick();
    };

    const handleMouseEnter = (e) => {
      const target = e.target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], select, summary, .cursor-pointer');
      if (target) {
        const id = target.id || target.dataset.soundId || Math.random().toString(36).slice(2);
        target.dataset.soundId = id;
        playHover(id);
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mouseover', handleMouseEnter, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseEnter);
    };
  }, [playClick, playHover]);

  return { playSuccess, playError, enable, disable };
};