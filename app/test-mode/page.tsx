'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Users, Clock, Sparkles, Database, Cloud, ToggleLeft, ToggleRight } from 'lucide-react';
import GameShowHost from '@/components/GameShowHost';

const PRIZE_LEVELS = [
  { level: 1, amount: '$100' },
  { level: 2, amount: '$200' },
  { level: 3, amount: '$300' },
  { level: 4, amount: '$500' },
  { level: 5, amount: '$1,000', safe: true },
  { level: 6, amount: '$2,000' },
  { level: 7, amount: '$4,000' },
  { level: 8, amount: '$8,000' },
  { level: 9, amount: '$16,000' },
  { level: 10, amount: '$32,000', safe: true },
  { level: 11, amount: '$64,000' },
  { level: 12, amount: '$125,000' },
  { level: 13, amount: '$250,000' },
  { level: 14, amount: '$500,000' },
  { level: 15, amount: '$1,000,000' },
];

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  explanation?: string;
  hostIntro?: string;
  hostCorrectResponse?: string;
  hostWrongResponse?: string;
  hostHint?: string;
}

export default function TestModePage() {
  const [useStaticQuestions, setUseStaticQuestions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hostMessage, setHostMessage] = useState<{ text: string; type: 'intro' | 'correct' | 'wrong' | 'hint' | 'dramatic' } | null>(null);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phone: true,
    audience: true,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [audiencePoll, setAudiencePoll] = useState<{ [key: string]: number } | null>(null);

  useEffect(() => {
    loadQuestion();
  }, [currentLevel, useStaticQuestions]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeOut();
    }
  }, [timeLeft, showResult, gameOver]);

  const loadQuestion = async () => {
    try {
      const endpoint = useStaticQuestions 
        ? `/api/questions/static?level=${currentLevel}`
        : `/api/questions/generate`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionNumber: currentLevel }),
      });
      
      const data = await response.json();
      setCurrentQuestion(data);
      setTimeLeft(60);
      setSelectedAnswer(null);
      setShowResult(false);
      setEliminatedOptions([]);
      setAudiencePoll(null);
      
      // Show host introduction if available
      if (data.hostIntro) {
        setHostMessage({ text: data.hostIntro, type: 'intro' });
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      // Use fallback question
      setCurrentQuestion({
        id: '1',
        question: 'What does R-value measure in insulation?',
        options: ['Resistance to heat flow', 'Reflectivity', 'Rigidity', 'Recyclability'],
        correctAnswer: 'Resistance to heat flow',
        difficulty: 'easy',
        category: 'Insulation',
        hostIntro: "Let's start with a fundamental building science question!",
        hostCorrectResponse: "THAT'S RIGHT! You're building a solid foundation of knowledge!",
        hostWrongResponse: "Oh, I'm sorry, that's not correct. R-value measures resistance to heat flow.",
        hostHint: "Think about what property of insulation keeps heat from moving through it..."
      });
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult || gameOver) return;
    setSelectedAnswer(answer);
    setHostMessage(null);
  };

  const handleFinalAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    setShowResult(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Show host response
    if (isCorrect && currentQuestion.hostCorrectResponse) {
      setHostMessage({ text: currentQuestion.hostCorrectResponse, type: 'correct' });
    } else if (!isCorrect && currentQuestion.hostWrongResponse) {
      setHostMessage({ 
        text: currentQuestion.hostWrongResponse.replace('[answer]', currentQuestion.correctAnswer), 
        type: 'wrong' 
      });
    }
    
    setTimeout(() => {
      if (isCorrect) {
        if (currentLevel === 15) {
          setGameOver(true);
          setHostMessage({ 
            text: "OH MY GOODNESS! YOU'VE DONE IT! YOU ARE A BUILDONAIRE! CONGRATULATIONS!", 
            type: 'dramatic' 
          });
        } else {
          setCurrentLevel(currentLevel + 1);
        }
      } else {
        setGameOver(true);
      }
    }, 3000);
  };

  const handleTimeOut = () => {
    setGameOver(true);
    setHostMessage({ text: "Oh no! Time's up! But you played wonderfully!", type: 'wrong' });
  };

  const use50_50 = () => {
    if (!lifelines.fiftyFifty || !currentQuestion) return;
    
    const incorrect = currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer);
    const toEliminate = incorrect.slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifelines({ ...lifelines, fiftyFifty: false });
    setHostMessage({ text: "Computer, please remove two incorrect answers!", type: 'dramatic' });
  };

  const usePhoneAFriend = () => {
    if (!lifelines.phone || !currentQuestion) return;
    
    const hint = currentQuestion.hostHint || `I'm pretty sure it's ${currentQuestion.correctAnswer}. Trust me on this one!`;
    setHostMessage({ text: hint, type: 'hint' });
    setLifelines({ ...lifelines, phone: false });
  };

  const useAskAudience = () => {
    if (!lifelines.audience || !currentQuestion) return;
    
    const poll: { [key: string]: number } = {};
    let remaining = 100;
    const correctPercentage = Math.floor(Math.random() * 30) + 40;
    poll[currentQuestion.correctAnswer] = correctPercentage;
    remaining -= correctPercentage;
    
    currentQuestion.options.forEach((option) => {
      if (option !== currentQuestion.correctAnswer && !poll[option]) {
        const percentage = Math.floor(Math.random() * remaining);
        poll[option] = percentage;
        remaining -= percentage;
      }
    });
    
    setAudiencePoll(poll);
    setHostMessage({ text: "Let's see what our studio audience thinks!", type: 'dramatic' });
    setLifelines({ ...lifelines, audience: false });
  };

  if (!currentQuestion) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-retrotec-darkRed to-retrotec-red flex items-center justify-center">
      <div className="text-white text-2xl">Loading Test Mode...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-retrotec-darkRed to-retrotec-red p-4">
      {/* Mode Toggle */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">Question Source:</span>
            <button
              onClick={() => setUseStaticQuestions(!useStaticQuestions)}
              className="flex items-center gap-3 bg-white/20 rounded-full px-4 py-2 text-white hover:bg-white/30 transition-colors"
            >
              {useStaticQuestions ? (
                <>
                  <Database className="w-5 h-5 text-retrotec-yellow" />
                  <span>Static Database</span>
                  <ToggleRight className="w-8 h-8 text-retrotec-yellow" />
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <span>OpenAI Dynamic</span>
                  <ToggleLeft className="w-8 h-8 text-blue-400" />
                </>
              )}
            </button>
          </div>
          <div className="text-white">
            <span className="text-sm opacity-75">Test Mode</span>
            {useStaticQuestions && (
              <span className="ml-2 text-retrotec-yellow">• 100 Pre-loaded Questions</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            {/* Timer and Lifelines */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={use50_50}
                  disabled={!lifelines.fiftyFifty}
                  className={`p-3 rounded-lg ${lifelines.fiftyFifty ? 'bg-retrotec-red hover:bg-retrotec-darkRed' : 'bg-gray-600 opacity-50'} text-white transition-colors`}
                >
                  50/50
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={usePhoneAFriend}
                  disabled={!lifelines.phone}
                  className={`p-3 rounded-lg ${lifelines.phone ? 'bg-retrotec-red hover:bg-retrotec-darkRed' : 'bg-gray-600 opacity-50'} text-white transition-colors`}
                >
                  <Phone className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={useAskAudience}
                  disabled={!lifelines.audience}
                  className={`p-3 rounded-lg ${lifelines.audience ? 'bg-retrotec-red hover:bg-retrotec-darkRed' : 'bg-gray-600 opacity-50'} text-white transition-colors`}
                >
                  <Users className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Question Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6"
            >
              <div className="text-center mb-8">
                <p className="text-retrotec-yellow text-lg mb-2">
                  Question {currentLevel} for {PRIZE_LEVELS[currentLevel - 1].amount}
                </p>
                <span className="text-sm text-white/75 bg-white/10 px-3 py-1 rounded-full">
                  {currentQuestion.category}
                </span>
                <h2 className="text-white text-2xl font-semibold mt-4">{currentQuestion.question}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isEliminated = eliminatedOptions.includes(option);
                  const isCorrect = showResult && option === currentQuestion.correctAnswer;
                  const isWrong = showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer;
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={!isEliminated && !showResult ? { scale: 1.02 } : {}}
                      whileTap={!isEliminated && !showResult ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isEliminated || showResult}
                      className={`p-4 rounded-lg text-white font-medium transition-all duration-300 ${
                        isEliminated ? 'bg-gray-700/50 opacity-50 cursor-not-allowed' :
                        isCorrect ? 'bg-green-600' :
                        isWrong ? 'bg-red-600' :
                        selectedAnswer === option ? 'bg-retrotec-yellow text-gray-900' :
                        'bg-retrotec-red/50 hover:bg-retrotec-red'
                      }`}
                    >
                      <span className="mr-2">{String.fromCharCode(65 + index)}:</span>
                      {option}
                      {audiencePoll && audiencePoll[option] && (
                        <span className="ml-2 text-sm opacity-75">({audiencePoll[option]}%)</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {selectedAnswer && !showResult && (
                <div className="mt-6 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinalAnswer}
                    className="bg-gradient-to-r from-retrotec-yellow to-retrotec-darkYellow text-gray-900 font-bold px-8 py-3 rounded-full"
                  >
                    Final Answer
                  </motion.button>
                </div>
              )}

              {showResult && currentQuestion.explanation && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <p className="text-white/90">{currentQuestion.explanation}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Prize Ladder */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
              <h3 className="text-retrotec-yellow font-bold mb-4 text-center">Prize Ladder</h3>
              <div className="space-y-2">
                {PRIZE_LEVELS.slice().reverse().map((level) => (
                  <div
                    key={level.level}
                    className={`px-3 py-2 rounded-lg text-center transition-all ${
                      currentLevel === level.level
                        ? 'bg-retrotec-yellow text-gray-900 font-bold'
                        : currentLevel > level.level
                        ? 'bg-green-600/30 text-green-300'
                        : 'bg-white/5 text-white/60'
                    } ${level.safe ? 'border-2 border-retrotec-yellow/50' : ''}`}
                  >
                    <span className="text-sm">{level.level}.</span> {level.amount}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Show Host */}
      {hostMessage && (
        <GameShowHost 
          message={hostMessage.text}
          type={hostMessage.type}
          prizeAmount={PRIZE_LEVELS[currentLevel - 1].amount}
          onComplete={() => setHostMessage(null)}
        />
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {currentLevel === 15 && selectedAnswer === currentQuestion.correctAnswer ? 
                '🎉 BUILDONAIRE!' : 'Game Over'}
            </h2>
            <p className="text-xl mb-2 text-gray-700">
              You won: <span className="font-bold text-retrotec-red">
                {currentLevel > 1 ? PRIZE_LEVELS[currentLevel - 2].amount : '$0'}
              </span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-retrotec-red to-retrotec-darkRed text-white px-6 py-3 rounded-lg font-semibold"
              >
                Play Again in Test Mode
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}