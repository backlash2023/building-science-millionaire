'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, MessageCircle } from 'lucide-react';

interface GameShowHostProps {
  message: string;
  type: 'intro' | 'correct' | 'wrong' | 'hint' | 'dramatic' | 'milestone' | 'tension' | 'encouragement';
  showTypewriter?: boolean;
  onComplete?: () => void;
  prizeAmount?: string;
}

export default function GameShowHost({ message, type, onComplete, prizeAmount, showTypewriter = true }: GameShowHostProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSparkles, setShowSparkles] = useState(false);

  // Typewriter effect for dramatic delivery
  useEffect(() => {
    if (!showTypewriter) {
      setDisplayText(message);
      setIsTyping(false);
      if (type === 'correct' || type === 'milestone') {
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 2000);
      }
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    let currentIndex = 0;
    
    // Different typing speeds for different message types
    const getTypingSpeed = () => {
      switch (type) {
        case 'dramatic': 
        case 'tension': return 100; // Slower for drama
        case 'milestone': return 50;  // Medium for celebration
        case 'encouragement': return 40; // Faster for encouragement
        case 'wrong': return 60; // Gentle for bad news
        default: return 30; // Normal speed
      }
    };
    
    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        if (type === 'correct' || type === 'milestone') {
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 3000);
        }
        if (onComplete) {
          setTimeout(onComplete, 2000);
        }
      }
    }, getTypingSpeed());

    return () => clearInterval(typeInterval);
  }, [message, type, onComplete, showTypewriter]);

  const getHostColor = () => {
    switch (type) {
      case 'correct': return 'from-green-500 to-emerald-600';
      case 'wrong': return 'from-red-500 to-red-600';
      case 'hint': return 'from-blue-500 to-blue-600';
      case 'dramatic': return 'from-purple-500 to-purple-600';
      case 'milestone': return 'from-yellow-500 to-yellow-600';
      case 'tension': return 'from-orange-500 to-red-500';
      case 'encouragement': return 'from-cyan-500 to-blue-500';
      default: return 'from-retrotec-red to-retrotec-darkRed';
    }
  };

  const getHostIcon = () => {
    switch (type) {
      case 'hint': return <MessageCircle className="w-6 h-6" />;
      case 'correct': 
      case 'dramatic':
      case 'milestone': return <Sparkles className="w-6 h-6" />;
      case 'encouragement': return <span className="text-lg">👍</span>;
      case 'tension': return <span className="text-lg">⏰</span>;
      default: return <Mic className="w-6 h-6" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative max-w-2xl mx-auto w-full"
      >
        <div className={`bg-gradient-to-r ${getHostColor()} rounded-2xl shadow-2xl p-1`}>
          <div className="bg-gray-900 rounded-xl p-6">
            {/* Host Avatar */}
            <div className="flex items-start gap-4">
              <motion.div 
                animate={{ 
                  rotate: type === 'correct' ? [0, -10, 10, -10, 10, 0] : 0,
                  scale: type === 'dramatic' ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${
                  type === 'milestone' ? 'from-yellow-400 to-yellow-600' :
                  type === 'correct' ? 'from-green-400 to-green-600' :
                  type === 'wrong' ? 'from-red-400 to-red-600' :
                  type === 'dramatic' ? 'from-purple-400 to-purple-600' :
                  'from-retrotec-yellow to-retrotec-darkYellow'
                } rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-gray-900">RB</span>
                </div>
              </motion.div>

              <div className="flex-1">
                {/* Host Name Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {getHostIcon()}
                  <span className="text-retrotec-yellow font-bold">
                    Regis Buildonaire
                    {type === 'milestone' && ' 🏆'}
                    {type === 'dramatic' && ' ✨'}
                    {type === 'encouragement' && ' 💪'}
                  </span>
                  {prizeAmount && (
                    <span className="text-white bg-retrotec-red/50 px-2 py-1 rounded-full text-sm">
                      Playing for {prizeAmount}
                    </span>
                  )}
                </div>

                {/* Message */}
                <div className="text-white text-lg leading-relaxed">
                  {displayText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </div>

                {/* Dramatic pauses indicator */}
                {(type === 'dramatic' || type === 'tension') && (displayText.includes('...') || isTyping) && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex gap-1 mt-2"
                  >
                    <div className="w-2 h-2 bg-retrotec-yellow rounded-full" />
                    <div className="w-2 h-2 bg-retrotec-yellow rounded-full" />
                    <div className="w-2 h-2 bg-retrotec-yellow rounded-full" />
                  </motion.div>
                )}
                
                {/* Building science themed encouragement */}
                {type === 'encouragement' && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-cyan-400 text-sm mt-2 italic"
                  >
                    &quot;Every great building starts with a solid foundation of knowledge!&quot;
                  </motion.div>
                )}
              </div>
            </div>

            {/* Celebration Effects */}
            {showSparkles && (type === 'correct' || type === 'milestone') && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * 400 - 200,
                      y: 0,
                      opacity: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      y: -120,
                      opacity: 0,
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: i * 0.1 
                    }}
                    className="absolute top-1/2 left-1/2"
                  >
                    {type === 'milestone' ? (
                      <span className="text-2xl">🎉</span>
                    ) : (
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Catchphrase badges */}
        {type === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 right-4"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-full shadow-lg">
              Building Success! ✓
            </div>
          </motion.div>
        )}
        
        {type === 'milestone' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute -top-4 left-4"
          >
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-gray-900 font-bold px-4 py-2 rounded-full shadow-lg">
              Solid Foundation! 🏗️
            </div>
          </motion.div>
        )}
        
        {type === 'dramatic' && displayText.toLowerCase().includes('final answer') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold px-6 py-2 rounded-full shadow-lg text-sm">
              The Moment of Truth! ⚡
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}