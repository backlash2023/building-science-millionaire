'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, Sparkles, TrendingUp } from 'lucide-react';

interface AttractModeProps {
  onStart: () => void;
  leaderboard?: Array<{
    rank: number;
    playerName: string;
    company: string;
    score: number;
    won: boolean;
  }>;
}

const BUILDING_FACTS = [
  "Did you know? Proper air sealing can reduce energy costs by up to 20%!",
  "Fun fact: The average home has enough air leakage to equal a 2-square-foot hole!",
  "Building Science Tip: Moisture control is key to preventing mold and structural damage.",
  "Energy Fact: Buildings account for 40% of total energy consumption in the US.",
  "Did you know? A blower door test can identify hidden air leaks in minutes!",
  "Smart Building: Proper ventilation improves indoor air quality and occupant health.",
  "Retrotec Fact: Our equipment is used in over 50 countries worldwide!",
  "Building Science: The stack effect causes warm air to rise and escape through the attic.",
];

export default function AttractMode({ onStart, leaderboard = [] }: AttractModeProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    // Rotate between facts and leaderboard
    const interval = setInterval(() => {
      setShowLeaderboard(prev => !prev);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Change facts
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % BUILDING_FACTS.length);
    }, 5000);

    return () => clearInterval(factInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-retrotec-darkRed to-retrotec-red flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-retrotec-yellow/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
            }}
            animate={{
              y: -100,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        <AnimatePresence mode="wait">
          {showLeaderboard ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8"
              >
                <h1 className="text-7xl font-bold bg-gradient-to-r from-retrotec-yellow to-retrotec-darkYellow bg-clip-text text-transparent mb-4">
                  Who Wants to be a
                </h1>
                <h1 className="text-8xl font-bold bg-gradient-to-r from-retrotec-yellow to-white bg-clip-text text-transparent">
                  BUILDONAIRE!
                </h1>
              </motion.div>

              {leaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8"
                >
                  <h2 className="text-3xl font-bold text-retrotec-yellow mb-4 flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8" />
                    Today&apos;s Champions
                  </h2>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? 'bg-retrotec-yellow/20 border border-retrotec-yellow' : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${
                            index === 0 ? 'text-retrotec-yellow' : 'text-white'
                          }`}>
                            #{entry.rank}
                          </span>
                          <div className="text-left">
                            <p className="text-white font-semibold">{entry.playerName}</p>
                            <p className="text-gray-300 text-sm">{entry.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            entry.won ? 'text-retrotec-yellow' : 'text-white'
                          }`}>
                            ${entry.score.toLocaleString()}
                          </p>
                          {entry.won && (
                            <span className="text-xs text-retrotec-yellow">BUILDONAIRE!</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="facts"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-8"
              >
                <Sparkles className="w-24 h-24 text-retrotec-yellow mx-auto" />
              </motion.div>
              
              <h2 className="text-5xl font-bold text-white mb-8">
                Test Your Building Science Knowledge!
              </h2>
              
              <motion.div
                key={currentFactIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8"
              >
                <p className="text-2xl text-white leading-relaxed">
                  {BUILDING_FACTS[currentFactIndex]}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                >
                  <Trophy className="w-12 h-12 text-retrotec-yellow mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Win Prizes</h3>
                  <p className="text-gray-300">Up to 25% off Retrotec products!</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                >
                  <TrendingUp className="w-12 h-12 text-retrotec-yellow mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">15 Questions</h3>
                  <p className="text-gray-300">From $100 to $1,000,000!</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                >
                  <Sparkles className="w-12 h-12 text-retrotec-yellow mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">3 Lifelines</h3>
                  <p className="text-gray-300">50/50, Phone, and Audience!</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Play Button */}
        <motion.div className="flex justify-center mt-12">
          <motion.button
            onClick={onStart}
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(255, 209, 0, 0)",
                "0 0 0 20px rgba(255, 209, 0, 0.2)",
                "0 0 0 40px rgba(255, 209, 0, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-retrotec-yellow to-retrotec-darkYellow text-gray-900 font-bold text-3xl px-16 py-6 rounded-full shadow-2xl flex items-center gap-4"
          >
            <Play className="w-8 h-8" />
            TAP TO PLAY
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}