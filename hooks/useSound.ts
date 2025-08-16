import { useCallback, useEffect, useRef } from 'react';

type SoundName = 'correct' | 'wrong' | 'tick' | 'lifeline' | 'win' | 'gameOver' | 'buttonClick';

const SOUND_URLS: Record<SoundName, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  tick: '/sounds/tick.mp3',
  lifeline: '/sounds/lifeline.mp3',
  win: '/sounds/win.mp3',
  gameOver: '/sounds/game-over.mp3',
  buttonClick: '/sounds/button-click.mp3',
};

export function useSound() {
  const audioRefs = useRef<Record<SoundName, HTMLAudioElement | null>>({} as any);
  const isMuted = useRef(false);

  useEffect(() => {
    // Preload all sounds
    Object.entries(SOUND_URLS).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[name as SoundName] = audio;
    });

    return () => {
      // Clean up audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const playSound = useCallback((soundName: SoundName, volume: number = 0.5) => {
    if (isMuted.current) return;
    
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn(`Failed to play sound ${soundName}:`, err);
      });
    }
  }, []);

  const toggleMute = useCallback(() => {
    isMuted.current = !isMuted.current;
    return isMuted.current;
  }, []);

  return { playSound, toggleMute, isMuted: isMuted.current };
}

// Create placeholder sound files in public/sounds/
export const createPlaceholderSounds = () => {
  console.log('Sound files needed in public/sounds/:');
  console.log('- correct.mp3 (positive chime)');
  console.log('- wrong.mp3 (buzzer sound)');
  console.log('- tick.mp3 (clock tick)');
  console.log('- lifeline.mp3 (whoosh sound)');
  console.log('- win.mp3 (celebration fanfare)');
  console.log('- game-over.mp3 (sad trombone)');
  console.log('- button-click.mp3 (subtle click)');
};