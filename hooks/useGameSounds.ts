import { useEffect, useRef, useState } from 'react';

interface SoundEffects {
  backgroundMusic: string;
  correctAnswer: string;
  wrongAnswer: string;
  finalAnswer: string;
  lifelineUsed: string;
  timerWarning: string;
  millionWin: string;
  drumRoll: string;
}

// Sound file paths - you'll need to add these audio files to the public folder
const SOUNDS: SoundEffects = {
  backgroundMusic: '/sounds/background-music.mp3',
  correctAnswer: '/sounds/correct.mp3',
  wrongAnswer: '/sounds/wrong.mp3',
  finalAnswer: '/sounds/final-answer.mp3',
  lifelineUsed: '/sounds/lifeline.mp3',
  timerWarning: '/sounds/timer-warning.mp3',
  millionWin: '/sounds/million-win.mp3',
  drumRoll: '/sounds/drum-roll.mp3',
};

export function useGameSounds() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  // Audio refs for different sounds
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize background music
    if (typeof window !== 'undefined') {
      backgroundMusicRef.current = new Audio(SOUNDS.backgroundMusic);
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = volume * 0.3; // Background music quieter
    }

    return () => {
      // Cleanup
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  const playBackgroundMusic = () => {
    if (!isMuted && backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume * 0.3;
      backgroundMusicRef.current.play().catch(e => {
        console.log('Background music autoplay prevented:', e);
      });
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
  };

  const playSound = (soundType: keyof SoundEffects) => {
    if (isMuted) return;

    try {
      // Stop any currently playing sound effect
      if (soundEffectRef.current) {
        soundEffectRef.current.pause();
      }

      // Create inline audio data URLs for demo (these are simple placeholder sounds)
      const sounds: Record<string, string> = {
        correctAnswer: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        wrongAnswer: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        finalAnswer: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        lifelineUsed: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        timerWarning: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        millionWin: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
        drumRoll: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAABQSwECAA==',
      };

      // Try to play from file first, fallback to inline data
      soundEffectRef.current = new Audio(SOUNDS[soundType]);
      soundEffectRef.current.volume = volume;
      
      soundEffectRef.current.onerror = () => {
        // Fallback to inline placeholder sound
        if (sounds[soundType]) {
          soundEffectRef.current = new Audio(sounds[soundType]);
          soundEffectRef.current.volume = volume;
          soundEffectRef.current.play().catch(console.error);
        }
      };

      soundEffectRef.current.play().catch(e => {
        console.log(`Could not play ${soundType}:`, e);
        // Try inline sound as fallback
        if (sounds[soundType]) {
          soundEffectRef.current = new Audio(sounds[soundType]);
          soundEffectRef.current.volume = volume;
          soundEffectRef.current.play().catch(console.error);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        stopBackgroundMusic();
      } else {
        playBackgroundMusic();
      }
      return newMuted;
    });
  };

  const setMasterVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = newVolume * 0.3;
    }
  };

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleMute,
    setMasterVolume,
    isMuted,
    volume,
  };
}

// Web Audio API for generating simple tones (fallback for missing audio files)
export function generateTone(frequency: number, duration: number, volume: number = 0.5) {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Play simple beep sounds as placeholders
export const playBeep = (type: 'success' | 'error' | 'warning' | 'info') => {
  const tones = {
    success: { frequency: 800, duration: 200 },
    error: { frequency: 300, duration: 400 },
    warning: { frequency: 500, duration: 300 },
    info: { frequency: 600, duration: 150 },
  };
  
  const tone = tones[type];
  generateTone(tone.frequency, tone.duration, 0.3);
};