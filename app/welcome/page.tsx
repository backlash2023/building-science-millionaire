'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Sparkles } from 'lucide-react';
import GameShowHost from '@/components/GameShowHost';
import { useTTS } from '@/hooks/useTTS';

export default function WelcomePage() {
  const router = useRouter();
  const { speak, stop, toggleMute, isMuted, isLoading } = useTTS();
  const [player, setPlayer] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);

  const dialogues = [
    {
      text: `Welcome to Who Wants to be a Buildonaire!`,
      duration: 3000,
      type: 'intro'
    },
    {
      text: `I'm your host, Regis Buildonaire, and tonight, you have the chance to win ONE MILLION DOLLARS!`,
      duration: 5000,
      type: 'intro'
    },
    {
      text: `You'll face 15 questions about building science, each one more challenging than the last.`,
      duration: 4000,
      type: 'intro'
    },
    {
      text: `You'll have three lifelines to help you along the way: 50:50, Phone a Friend, and Ask the Audience.`,
      duration: 5000,
      type: 'intro'
    },
    {
      text: `Remember, you can walk away at any time with your current winnings, but once you give your final answer, there's no going back!`,
      duration: 6000,
      type: 'dramatic'
    },
    {
      text: `Are you ready to become a BUILDONAIRE?`,
      duration: 3000,
      type: 'dramatic'
    }
  ];

  useEffect(() => {
    // Get player data from sessionStorage
    const storedPlayer = sessionStorage.getItem('player');
    if (!storedPlayer) {
      router.push('/');
      return;
    }
    
    const playerData = JSON.parse(storedPlayer);
    setPlayer(playerData);
    
    // Customize first dialogue with player name
    dialogues[0].text = `Welcome ${playerData.firstName}, to Who Wants to be a Buildonaire!`;
    
    // Start the dialogue sequence
    setTimeout(() => {
      setIsPlaying(true);
      playDialogue();
    }, 1000);
  }, []);

  const playDialogue = () => {
    let currentStep = 0;
    
    const showNextDialogue = () => {
      if (currentStep < dialogues.length) {
        setDialogueStep(currentStep);
        
        // Play TTS using OpenAI
        const currentDialogue = dialogues[currentStep];
        speak(currentDialogue.text, {
          voice: 'echo', // Game show host voice
          speed: 0.95,   // Slightly slower for dramatic effect
          onEnd: () => {
            // Move to next dialogue after current one finishes
            if (currentStep < dialogues.length - 1) {
              setTimeout(() => {
                currentStep++;
                showNextDialogue();
              }, 500); // Small pause between dialogues
            } else {
              // Show start button after all dialogues
              setShowStartButton(true);
            }
          }
        });
        
        currentStep++;
      }
    };
    
    showNextDialogue();
  };

  const handleStartGame = () => {
    stop(); // Stop any playing audio
    router.push('/game');
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  if (!player) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated spotlight effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 20 
            }}
            animate={{
              y: -20,
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Mute button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleToggleMute}
        className="absolute top-4 right-4 z-50 p-3 bg-blue-800/50 rounded-full border border-yellow-400/30 hover:bg-blue-800/70 transition-all"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-yellow-400" />
        ) : (
          <Volume2 className="w-6 h-6 text-yellow-400" />
        )}
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Game Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <h1 className="relative text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text">
                WHO WANTS TO BE A
              </span>
            </h1>
            <h1 className="relative text-6xl md:text-8xl font-bold">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-transparent bg-clip-text">
                BUILDONAIRE!
              </span>
            </h1>
          </div>
        </motion.div>

        {/* Host Dialogue */}
        <AnimatePresence mode="wait">
          {isPlaying && dialogueStep < dialogues.length && (
            <motion.div
              key={dialogueStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <GameShowHost
                message={dialogues[dialogueStep].text}
                type={dialogues[dialogueStep].type as 'intro' | 'dramatic'}
                showTypewriter={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prize Structure Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { amount: '$1,000,000', label: 'Grand Prize' },
            { amount: '15', label: 'Questions' },
            { amount: '3', label: 'Lifelines' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5 + index * 0.2, type: "spring" }}
              className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30 text-center"
            >
              <div className="text-3xl font-bold text-yellow-400">{item.amount}</div>
              <div className="text-white/80 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Start Game Button */}
        <AnimatePresence>
          {showStartButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="text-center"
            >
              <motion.button
                onClick={handleStartGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                
                {/* Button */}
                <div className="relative px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-blue-900 font-bold text-2xl shadow-2xl flex items-center space-x-3">
                  <Play className="w-8 h-8" />
                  <span>LET&apos;S PLAY!</span>
                  <Sparkles className="w-8 h-8" />
                </div>
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 mt-4"
              >
                Press to enter the hot seat and begin your journey to $1,000,000!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"
      />
    </div>
  );
}