import { useState, useRef, useCallback, useEffect } from 'react';

interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Array<{ text: string; options?: TTSOptions }>>([]);
  const isProcessingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const { text, options } = queueRef.current.shift()!;

    try {
      await speakInternal(text, options);
    } catch (error) {
      console.error('TTS queue error:', error);
    } finally {
      isProcessingRef.current = false;
      // Process next item in queue
      if (queueRef.current.length > 0) {
        processQueue();
      }
    }
  }, []);

  const speakInternal = async (text: string, options?: TTSOptions) => {
    if (isMuted) {
      options?.onEnd?.();
      return;
    }

    setIsLoading(true);

    try {
      // Call our TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options?.voice || 'echo',
          speed: options?.speed || 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.8;

      audioRef.current.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        options?.onEnd?.();
      };

      audioRef.current.onerror = (e) => {
        setIsPlaying(false);
        setIsLoading(false);
        console.error('Audio playback error:', e);
        options?.onError?.(new Error('Audio playback failed'));
      };

      await audioRef.current.play();
    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      console.error('TTS error:', error);
      options?.onError?.(error as Error);
    }
  };

  const speak = useCallback((text: string, options?: TTSOptions) => {
    // Add to queue
    queueRef.current.push({ text, options });
    processQueue();
  }, [processQueue]);

  const speakImmediate = useCallback(async (text: string, options?: TTSOptions) => {
    // Clear queue and current audio
    queueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Speak immediately
    await speakInternal(text, options);
  }, [isMuted]);

  const stop = useCallback(() => {
    // Clear queue
    queueRef.current = [];
    isProcessingRef.current = false;
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        stop();
      }
      return newMuted;
    });
  }, [stop]);

  return {
    speak,
    speakImmediate,
    stop,
    toggleMute,
    isPlaying,
    isLoading,
    isMuted,
  };
}

// Pre-cache common phrases for better performance
export async function precachePhrases() {
  const commonPhrases = [
    "Is that your final answer?",
    "Correct!",
    "I'm sorry, that's incorrect.",
    "Let's play Who Wants to be a Buildonaire!",
  ];

  for (const phrase of commonPhrases) {
    try {
      await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: phrase, voice: 'echo' }),
      });
    } catch (error) {
      console.error('Failed to precache phrase:', phrase);
    }
  }
}