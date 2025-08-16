'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Users, Percent, Timer, Volume2, VolumeX, 
  AlertCircle, Trophy, DollarSign, Sparkles 
} from 'lucide-react';
import GameShowHost from '@/components/GameShowHost';
import { useTTS } from '@/hooks/useTTS';
import { useGameSounds, playBeep } from '@/hooks/useGameSounds';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  explanation: string;
  hostIntro?: string;
  hostCorrectResponse?: string;
  hostWrongResponse?: string;
  hostHint?: string;
}

const prizeAmounts = [
  { level: 1, amount: '$100', safe: false },
  { level: 2, amount: '$200', safe: false },
  { level: 3, amount: '$300', safe: false },
  { level: 4, amount: '$500', safe: false },
  { level: 5, amount: '$1,000', safe: true },
  { level: 6, amount: '$2,000', safe: false },
  { level: 7, amount: '$4,000', safe: false },
  { level: 8, amount: '$8,000', safe: false },
  { level: 9, amount: '$16,000', safe: false },
  { level: 10, amount: '$32,000', safe: true },
  { level: 11, amount: '$64,000', safe: false },
  { level: 12, amount: '$125,000', safe: false },
  { level: 13, amount: '$250,000', safe: false },
  { level: 14, amount: '$500,000', safe: false },
  { level: 15, amount: '$1,000,000', safe: false },
];

export default function MillionaireGame() {
  const router = useRouter();
  const { speak, speakImmediate, stop, toggleMute: toggleTTSMute, isMuted: isTTSMuted } = useTTS();
  const { playSound, playBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('Player');
  
  // Lifelines
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phoneAFriend: true,
    askAudience: true
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [audiencePoll, setAudiencePoll] = useState<Record<string, number> | null>(null);
  const [phoneHint, setPhoneHint] = useState<string | null>(null);
  
  // Host messages
  const [hostMessage, setHostMessage] = useState('');
  const [hostMessageType, setHostMessageType] = useState<'intro' | 'correct' | 'wrong' | 'hint' | 'dramatic' | 'milestone' | 'tension' | 'encouragement'>('intro');

  // Enhanced host dialogue system
  const getHostDialogue = () => {
    const prizeLevel = currentLevel;
    const currentPrize = prizeAmounts[currentLevel - 1];
    const isMilestone = currentPrize.safe;
    const isHighStakes = prizeLevel >= 10;
    const isMillionQuestion = prizeLevel === 15;
    
    return {
      welcome: [
        `Welcome, welcome, ${playerName}! I'm absolutely DELIGHTED to have you here on Who Wants to be a Buildonaire!`,
        `${playerName}, my friend, are you ready to test your building science knowledge and maybe, just MAYBE, become a millionaire?`,
        `Ladies and gentlemen, we have ${playerName} in the hot seat! Let's see if those construction smarts can build a path to a MILLION DOLLARS!`
      ],
      
      questionIntros: {
        easy: [
          `Alright ${playerName}, let's start building your fortune! For ${currentPrize?.amount}, here's your foundation question...`,
          `${playerName}, we're laying the groundwork here. For ${currentPrize?.amount}, let's see what you know...`,
          `This first question should be solid as concrete, ${playerName}. For ${currentPrize?.amount}...`
        ],
        medium: [
          `Now we're getting into the STRUCTURE of the game, ${playerName}! For ${currentPrize?.amount}, this one might require some engineering thinking...`,
          `${playerName}, we're building momentum! For ${currentPrize?.amount}, let's see if your knowledge is up to code...`,
          `The stakes are rising like a well-designed building, ${playerName}! For ${currentPrize?.amount}...`
        ],
        hard: [
          `OH MY! We're in the penthouse now, ${playerName}! For ${currentPrize?.amount}, this question could make or break your fortune...`,
          `${playerName}, we've reached the structural steel level of difficulty! For ${currentPrize?.amount}, you'll need ALL your expertise...`,
          `This is where the REAL building scientists separate from the apprentices, ${playerName}! For ${currentPrize?.amount}...`
        ]
      },
      
      milestoneIntros: [
        `${playerName}, you've reached a GUARANTEED level! You cannot fall below ${currentPrize?.amount}! How does that feel?`,
        `FANTASTIC! ${playerName}, you're now guaranteed to walk away with at least ${currentPrize?.amount}! Your foundation is SOLID!`,
        `What a BUILDING! ${playerName}, you've secured ${currentPrize?.amount}! That's your safety net right there!`
      ],
      
      millionQuestionIntro: [
        `${playerName}... ${playerName}... This is it. The question that could make you a MILLIONAIRE! Are you ready for ONE MILLION DOLLARS?`,
        `OH MY GOODNESS, ${playerName}! We've built up to this moment! Fifteen questions have led us here... to ONE... MILLION... DOLLARS!`,
        `${playerName}, my friend, everything you've learned about building science has brought you to THIS moment! Can you construct the path to a MILLION DOLLARS?`
      ],
      
      correctResponses: {
        low: [
          `That's RIGHT! Excellent work, ${playerName}! You're building nicely!`,
          `YES! Beautiful answer! You know your stuff, ${playerName}!`,
          `CORRECT! You just laid another brick in your path to riches, ${playerName}!`,
          `That's it! Solid as a foundation, ${playerName}! Well done!`
        ],
        medium: [
          `THAT'S RIGHT! Outstanding, ${playerName}! Your knowledge is structurally sound!`,
          `YES! MAGNIFICENT! ${playerName}, you're building something SPECIAL here!`,
          `CORRECT! ${playerName}, that answer was engineered to PERFECTION!`,
          `FANTASTIC! You just passed another inspection, ${playerName}!`
        ],
        high: [
          `THAT'S RIGHT! OH MY GOODNESS! ${playerName}, you are INCREDIBLE!`,
          `YES! YES! YES! ${playerName}, that was MASTERFUL! You're in the penthouse now!`,
          `CORRECT! ${playerName}, I am watching a MASTER BUILDER at work!`,
          `UNBELIEVABLE! ${playerName}, your building science knowledge is LEGENDARY!`
        ],
        million: [
          `THAT'S... THAT'S... THAT'S RIGHT! ${playerName}, YOU'VE DONE IT! YOU ARE A MILLIONAIRE!`,
          `YES! OH MY STARS! ${playerName}, YOU'VE BUILT YOURSELF A MILLION-DOLLAR EMPIRE!`,
          `CORRECT! ${playerName}, you have just CONSTRUCTED the most beautiful thing I've ever seen - a MILLION DOLLARS!`
        ]
      },
      
      wrongResponses: [
        `Oh no, ${playerName}! I'm afraid that's not quite right. The correct answer was [answer]. But hey, you've built something wonderful here!`,
        `Ooh, not this time, ${playerName}. The answer we were looking for was [answer]. But what a TREMENDOUS effort you've made!`,
        `${playerName}, that's not the answer, my friend. It was [answer]. But you should be PROUD of how far you've come!`,
        `I'm sorry, ${playerName}, but that's incorrect. The right answer was [answer]. You've played BEAUTIFULLY though!`
      ],
      
      encouragement: [
        `Take your time, ${playerName}. No pressure... well, maybe a LITTLE pressure! *chuckle*`,
        `Think it through, ${playerName}. Use that building science brain of yours!`,
        `${playerName}, you've come this far! Trust your instincts!`,
        `Remember ${playerName}, you know more than you think you do!`
      ],
      
      tension: [
        `The audience is on the edge of their seats, ${playerName}...`,
        `You can hear a pin drop in here, ${playerName}...`,
        `This is it, ${playerName}. This is the moment...`,
        `${playerName}, the tension is BUILDING... if you'll pardon the pun!`
      ],
      
      finalAnswerDramatic: [
        `${playerName}... is that your FINAL answer?`,
        `Are you absolutely, positively CERTAIN, ${playerName}? Is that your final answer?`,
        `${playerName}, my friend, you need to be sure. Is that... your... FINAL answer?`,
        `Think carefully, ${playerName}. Is that the answer you want to lock in?`
      ],
      
      lifelineReactions: {
        fiftyFifty: [
          `Alright ${playerName}, let's eliminate some wrong answers and clear the blueprint!`,
          `Smart move, ${playerName}! Let's remove some of those faulty options!`,
          `Good strategy! ${playerName}, let's clean up these choices!`
        ],
        phone: [
          `${playerName}, let's call in a building expert! Someone who knows their thermal dynamics from their air barriers!`,
          `Time to phone a friend, ${playerName}! Hopefully they've got some solid construction knowledge!`,
          `Let's get some backup, ${playerName}! Every good project needs a consultant!`
        ],
        audience: [
          `${playerName}, let's see what our fantastic audience of building professionals thinks!`,
          `Our audience is full of architects, engineers, and contractors, ${playerName}! Let's hear from them!`,
          `The collective wisdom of the building science community, ${playerName}! Audience, vote now!`
        ]
      },
      
      walkAwayEncouragement: [
        `${playerName}, you've built yourself a WONDERFUL prize with ${prizeAmounts[currentLevel - 2]?.amount}! Sometimes knowing when to stop construction is the smartest move!`,
        `That's a wise decision, ${playerName}! You're walking away with ${prizeAmounts[currentLevel - 2]?.amount} - that's fantastic!`,
        `${playerName}, you've constructed a beautiful winnings of ${prizeAmounts[currentLevel - 2]?.amount}! Sometimes the best builders know when the structure is complete!`
      ]
    };
  };
  
  // Helper function to get random dialogue
  const getRandomDialogue = (dialogueArray: string[]) => {
    return dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
  };

  // Load question
  useEffect(() => {
    loadQuestion();
  }, [currentLevel]);

  // Initialize game on mount
  useEffect(() => {
    // Get player info from session
    const playerData = sessionStorage.getItem('player');
    if (playerData) {
      const player = JSON.parse(playerData);
      setPlayerId(player.id);
      setPlayerName(player.name || player.firstName || 'Player');
      
      // Start a new game
      startNewGame(player.id);
      
      // Welcome the player with fanfare
      setTimeout(() => {
        const welcomeMessages = [
          `Welcome, welcome, ${player.name || player.firstName || 'Player'}! I'm absolutely DELIGHTED to have you here on Who Wants to be a Buildonaire!`,
          `${player.name || player.firstName || 'Player'}, my friend, are you ready to test your building science knowledge and maybe, just MAYBE, become a millionaire?`,
          `Ladies and gentlemen, we have ${player.name || player.firstName || 'Player'} in the hot seat! Let's see if those construction smarts can build a path to a MILLION DOLLARS!`
        ];
        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        setHostMessage(welcomeMessage);
        setHostMessageType('intro');
        speakImmediate(welcomeMessage, { 
          voice: 'echo', 
          speed: 1.0,
          onEnd: () => {
            setTimeout(() => {
              setHostMessage('');
            }, 3000);
          }
        });
      }, 1000);
    }
    
    playBackgroundMusic();
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const startNewGame = async (pid: string) => {
    try {
      const response = await fetch('/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: pid })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameId(data.game.id);
        console.log('Game started:', data.game.id);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  // Timer with warning sound and encouragement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      // Play warning sound when time is running out
      if (timeLeft === 10) {
        playBeep('warning');
        const dialogue = getHostDialogue();
        const urgentMessages = [
          `${playerName}, ten seconds left! Trust your building science instincts!`,
          `Time's running short, ${playerName}! What does your construction experience tell you?`,
          `${playerName}, the foundation of a good answer is your knowledge - what's your gut feeling?`
        ];
        const urgentMessage = getRandomDialogue(urgentMessages);
        setHostMessage(urgentMessage);
        setHostMessageType('tension');
      } else if (timeLeft === 30 && !selectedAnswer) {
        // Gentle encouragement at 30 seconds if no answer selected
        const dialogue = getHostDialogue();
        const encouragementMessage = getRandomDialogue(dialogue.encouragement);
        setHostMessage(encouragementMessage);
        setHostMessageType('encouragement');
      }
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, selectedAnswer, playerName]);

  const loadQuestion = async () => {
    try {
      const response = await fetch('/api/questions/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel })
      });
      
      if (response.ok) {
        const question = await response.json();
        setCurrentQuestion(question);
        setSelectedAnswer(null);
        setLockedAnswer(null);
        setShowResult(false);
        setEliminatedOptions([]);
        setAudiencePoll(null);
        setPhoneHint(null);
        setTimeLeft(60);
        setIsTimerActive(true);
        
        // Generate dynamic host introduction based on level and context
        const dialogue = getHostDialogue();
        let hostIntro = '';
        
        // Check for milestone levels
        if (prizeAmounts[currentLevel - 1].safe && currentLevel > 1) {
          hostIntro = getRandomDialogue(dialogue.milestoneIntros);
          setHostMessageType('milestone');
        } else if (currentLevel === 15) {
          hostIntro = getRandomDialogue(dialogue.millionQuestionIntro);
          setHostMessageType('dramatic');
        } else {
          // Determine difficulty level for intro
          const difficulty = currentLevel <= 5 ? 'easy' : currentLevel <= 10 ? 'medium' : 'hard';
          hostIntro = getRandomDialogue(dialogue.questionIntros[difficulty]);
          setHostMessageType('intro');
        }
        
        // Use custom intro or fallback to question's intro
        const finalIntro = question.hostIntro || hostIntro;
        
        setHostMessage(finalIntro);
        
        // Stop any current speech first to prevent overlaps
        stop();
        
        // Combine intro and question into single speech to avoid overlaps
        const fullSpeech = `${finalIntro} ... ${question.question}. Your options are: A: ${question.options[0]}, B: ${question.options[1]}, C: ${question.options[2]}, D: ${question.options[3]}`;
        
        speakImmediate(fullSpeech, { 
          voice: 'echo', 
          speed: 0.9
        });
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      // Use fallback question
      setCurrentQuestion(getFallbackQuestion(currentLevel));
    }
  };

  const getFallbackQuestion = (level: number): Question => {
    // Fallback questions for demo
    const questions = [
      {
        id: '1',
        question: 'What does HVAC stand for?',
        options: [
          'Heating, Ventilation, and Air Conditioning',
          'High Voltage Alternating Current',
          'Home Ventilation and Cooling',
          'Heat, Vapor, and Air Control'
        ],
        correctAnswer: 'Heating, Ventilation, and Air Conditioning',
        difficulty: 'easy',
        category: 'HVAC Systems',
        explanation: 'HVAC stands for Heating, Ventilation, and Air Conditioning.',
        hostIntro: `For ${prizeAmounts[level - 1].amount}, here's your question...`,
        hostCorrectResponse: "That's absolutely correct! Well done!",
        hostWrongResponse: "I'm sorry, that's not right. The correct answer was...",
        hostHint: "Think about what keeps buildings comfortable in all seasons."
      }
    ];
    return questions[0];
  };

  const handleAnswerSelect = (answer: string) => {
    if (!lockedAnswer && !showResult) {
      setSelectedAnswer(answer);
      // Stop any current speech when user selects an answer
      stop();
      
      // Give encouraging feedback on selection
      const dialogue = getHostDialogue();
      const selectionMessages = [
        `Interesting choice, ${playerName}!`,
        `You've selected ${answer.charAt(0).toUpperCase()}... think it through, ${playerName}!`,
        `${playerName}, you're considering that option... trust your building science instincts!`,
        `That's your selection, ${playerName}. Take your time to be sure!`
      ];
      const selectionMessage = getRandomDialogue(selectionMessages);
      setHostMessage(selectionMessage);
      setHostMessageType('encouragement');
    }
  };

  const handleFinalAnswer = () => {
    if (!selectedAnswer || lockedAnswer) return;
    
    setLockedAnswer(selectedAnswer);
    setIsTimerActive(false);
    
    // Stop any current speech before asking
    stop();
    
    // Play dramatic "Is that your final answer?" with TTS
    const dialogue = getHostDialogue();
    const message = getRandomDialogue(dialogue.finalAnswerDramatic);
    setHostMessage(message);
    setHostMessageType('dramatic');
    speakImmediate(message, { 
      voice: 'echo', 
      speed: 0.85 // Slower for drama
    });
  };

  const confirmFinalAnswer = () => {
    if (!lockedAnswer) return;
    
    const correct = lockedAnswer === currentQuestion?.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Stop any current speech before result
    stop();
    
    if (correct) {
      playBeep('success'); // Play success sound
      
      // Generate dynamic correct response based on level
      const dialogue = getHostDialogue();
      let correctMessage = '';
      
      if (currentLevel === 15) {
        correctMessage = getRandomDialogue(dialogue.correctResponses.million);
      } else if (currentLevel >= 10) {
        correctMessage = getRandomDialogue(dialogue.correctResponses.high);
      } else if (currentLevel >= 5) {
        correctMessage = getRandomDialogue(dialogue.correctResponses.medium);
      } else {
        correctMessage = getRandomDialogue(dialogue.correctResponses.low);
      }
      
      // Use custom response or fallback
      const finalMessage = currentQuestion?.hostCorrectResponse || correctMessage;
      setHostMessage(finalMessage);
      setHostMessageType('correct');
      speakImmediate(finalMessage, { 
        voice: 'echo', 
        speed: currentLevel === 15 ? 1.1 : 1.0 // Excited for million
      });
      
      if (currentLevel === 15) {
        // Won the million!
        setTimeout(() => handleGameWin(), 4000);
      } else {
        // Continue to next question
        setTimeout(() => {
          setCurrentLevel(prev => prev + 1);
        }, 4000);
      }
    } else {
      playBeep('error'); // Play error sound
      
      // Generate empathetic wrong response
      const dialogue = getHostDialogue();
      let wrongMessage = currentQuestion?.hostWrongResponse || getRandomDialogue(dialogue.wrongResponses);
      
      // Replace [answer] placeholder with actual correct answer
      if (wrongMessage.includes('[answer]')) {
        wrongMessage = wrongMessage.replace('[answer]', currentQuestion?.correctAnswer || '');
      }
      
      setHostMessage(wrongMessage);
      setHostMessageType('wrong');
      speakImmediate(wrongMessage, { voice: 'echo', speed: 0.9 });
      setTimeout(() => handleGameOver(), 3000);
    }
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    
    // Stop any current speech first
    stop();
    
    const dialogue = getHostDialogue();
    const timeUpMessages = [
      `Oh my, ${playerName}! Time's up! I'm afraid we have to take that as your final answer.`,
      `${playerName}, the clock has run out! In building, timing is everything, and time is UP!`,
      `Time's expired, ${playerName}! Just like a building permit, we can't extend the deadline!`
    ];
    const message = getRandomDialogue(timeUpMessages);
    setHostMessage(message);
    setHostMessageType('wrong');
    speakImmediate(message, { voice: 'echo', speed: 0.9 });
    setTimeout(() => handleGameOver(), 2000);
  };

  const handleGameOver = async () => {
    // Calculate winnings based on safe levels and questions answered
    let finalWinnings = 0;
    let actualScore = 0;
    
    // Determine the actual prize won based on questions answered correctly
    if (currentLevel > 1) {
      // They got at least one question right
      const lastCorrectLevel = currentLevel - 1;
      actualScore = parseInt(prizeAmounts[lastCorrectLevel - 1].amount.replace(/[$,]/g, ''));
      
      // But they only take home money if they reached a safe level
      if (currentLevel > 10) finalWinnings = 32000;
      else if (currentLevel > 5) finalWinnings = 1000;
    }
    
    setWinnings(finalWinnings);
    setGameOver(true);
    
    // Save game results - use actualScore for leaderboard ranking
    if (gameId) {
      const usedLifelines = [];
      if (!lifelines.fiftyFifty) usedLifelines.push('50-50');
      if (!lifelines.phoneAFriend) usedLifelines.push('phone');
      if (!lifelines.askAudience) usedLifelines.push('audience');
      
      try {
        await fetch('/api/games/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            finalScore: actualScore, // Use the actual score they achieved for leaderboard
            questionsAnswered: currentLevel - 1,
            correctAnswers: currentLevel - 1,
            prizeLevel: prizeAmounts[Math.max(0, currentLevel - 2)]?.amount || '$0',
            lifelinesUsed: usedLifelines,
            status: 'COMPLETED'
          })
        });
      } catch (error) {
        console.error('Failed to save game results:', error);
      }
    }
  };

  const handleGameWin = async () => {
    setWinnings(1000000);
    setGameOver(true);
    const message = "YOU'VE DONE IT! YOU ARE A MILLIONAIRE! CONGRATULATIONS!";
    setHostMessage(message);
    setHostMessageType('correct');
    speakImmediate(message, { voice: 'echo', speed: 1.1 }); // Excited delivery
    
    // Save winning game results
    if (gameId) {
      const usedLifelines = [];
      if (!lifelines.fiftyFifty) usedLifelines.push('50-50');
      if (!lifelines.phoneAFriend) usedLifelines.push('phone');
      if (!lifelines.askAudience) usedLifelines.push('audience');
      
      try {
        await fetch('/api/games/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            finalScore: 1000000,
            questionsAnswered: 15,
            correctAnswers: 15,
            prizeLevel: '$1,000,000',
            lifelinesUsed: usedLifelines,
            status: 'WON'
          })
        });
      } catch (error) {
        console.error('Failed to save winning game results:', error);
      }
    }
  };

  const handleWalkAway = async () => {
    const walkAwayAmount = currentLevel > 1 
      ? parseInt(prizeAmounts[currentLevel - 2].amount.replace(/[$,]/g, ''))
      : 0;
    setWinnings(walkAwayAmount);
    setGameOver(true);
    
    // Save game results for walk away
    if (gameId && currentLevel > 1) {
      const usedLifelines = [];
      if (!lifelines.fiftyFifty) usedLifelines.push('50-50');
      if (!lifelines.phoneAFriend) usedLifelines.push('phone');
      if (!lifelines.askAudience) usedLifelines.push('audience');
      
      try {
        await fetch('/api/games/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            finalScore: walkAwayAmount, // They keep what they've won
            questionsAnswered: currentLevel - 1,
            correctAnswers: currentLevel - 1,
            prizeLevel: prizeAmounts[currentLevel - 2]?.amount || '$0',
            lifelinesUsed: usedLifelines,
            status: 'WALKED_AWAY'
          })
        });
      } catch (error) {
        console.error('Failed to save walk away results:', error);
      }
    }
    
    // Stop any current speech first
    stop();
    
    // Generate encouraging walk-away message
    const dialogue = getHostDialogue();
    const message = getRandomDialogue(dialogue.walkAwayEncouragement);
    setHostMessage(message);
    setHostMessageType('encouragement');
    speakImmediate(message, { voice: 'echo', speed: 0.95 });
  };

  // Lifeline handlers
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || !currentQuestion) return;
    
    // Stop any current speech first
    stop();
    
    const dialogue = getHostDialogue();
    const intro = getRandomDialogue(dialogue.lifelineReactions.fiftyFifty);
    const fullMessage = `${intro} Computer, please remove two wrong answers.`;
    
    // Speak the complete message at once to avoid overlaps
    setHostMessage(fullMessage);
    setHostMessageType('intro');
    speakImmediate(fullMessage, { 
      voice: 'echo', 
      speed: 0.95
    });
    
    // Do the elimination after a short delay for effect
    setTimeout(() => {
      const wrongAnswers = currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer);
      const toEliminate = wrongAnswers.slice(0, 2);
      setEliminatedOptions(toEliminate);
      setLifelines(prev => ({ ...prev, fiftyFifty: false }));
    }, 1500);
  };

  const usePhoneAFriend = () => {
    if (!lifelines.phoneAFriend || !currentQuestion) return;
    
    // Stop any current speech first
    stop();
    
    const dialogue = getHostDialogue();
    const intro = getRandomDialogue(dialogue.lifelineReactions.phone);
    const hint = currentQuestion.hostHint || "I think you should trust your building science instincts on this one. The fundamentals are your foundation!";
    const fullMessage = `${intro} ... Your friend says: "${hint}"`;
    
    // Speak everything at once to avoid overlaps
    setPhoneHint(hint);
    setLifelines(prev => ({ ...prev, phoneAFriend: false }));
    setHostMessage(fullMessage);
    setHostMessageType('hint');
    speakImmediate(fullMessage, { 
      voice: 'echo', 
      speed: 0.9
    });
  };

  const useAskAudience = () => {
    if (!lifelines.askAudience || !currentQuestion) return;
    
    // Stop any current speech first
    stop();
    
    const dialogue = getHostDialogue();
    const intro = getRandomDialogue(dialogue.lifelineReactions.audience);
    const fullMessage = `${intro} Audience, please vote now! Show us your building science expertise!`;
    
    // Speak the complete intro at once
    setHostMessage(fullMessage);
    setHostMessageType('intro');
    speakImmediate(fullMessage, { 
      voice: 'echo', 
      speed: 0.95
    });
    
    // Generate poll results immediately
    const poll: Record<string, number> = {};
    const correctIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
    
    currentQuestion.options.forEach((opt, idx) => {
      if (idx === correctIndex) {
        poll[opt] = Math.floor(Math.random() * 30) + 50; // 50-80% for correct
      } else {
        poll[opt] = Math.floor(Math.random() * 20) + 5; // 5-25% for wrong
      }
    });
    
    // Normalize to 100%
    const total = Object.values(poll).reduce((a, b) => a + b, 0);
    Object.keys(poll).forEach(key => {
      poll[key] = Math.round((poll[key] / total) * 100);
    });
    
    // Show poll after a delay
    setTimeout(() => {
      setAudiencePoll(poll);
      setLifelines(prev => ({ ...prev, askAudience: false }));
      
      // Announce results (stop any speech first)
      stop();
      const resultMessage = "The results are in! Our building science experts have spoken!";
      setHostMessage(resultMessage);
      speakImmediate(resultMessage, { 
        voice: 'echo', 
        speed: 0.95 
      });
    }, 3000);
  };

  if (!currentQuestion) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-blue-800/20 via-transparent to-black/50" />
        {/* Animated spotlights */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Game Layout */}
      <div className="relative z-10 h-screen flex">
        {/* Left side - Game content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Top bar with timer and controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Image
                src="/logo.svg"
                alt="Who Wants to be a Buildonaire"
                width={150}
                height={60}
                className="object-contain"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <motion.div
                className={`flex items-center px-4 py-2 rounded-lg ${
                  timeLeft <= 10 ? 'bg-red-600/80' : 'bg-blue-800/50'
                } border border-yellow-400/30`}
                animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Timer className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-white font-bold text-xl">{timeLeft}s</span>
              </motion.div>
              
              {/* Mute button */}
              <button
                onClick={toggleTTSMute}
                className="p-2 bg-blue-800/50 rounded-lg border border-yellow-400/30 hover:bg-blue-800/70 transition-all"
              >
                {isTTSMuted ? (
                  <VolumeX className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-yellow-400" />
                )}
              </button>
            </div>
          </div>

          {/* Host messages */}
          {hostMessage && (
            <div className="mb-6 mt-4">
              <GameShowHost
                message={hostMessage}
                type={hostMessageType}
                showTypewriter={true}
              />
            </div>
          )}

          {/* Question display */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              key={currentQuestion.id}
              className="w-full max-w-4xl"
            >
              {/* Question text */}
              <div className="bg-gradient-to-br from-blue-800/80 to-purple-800/80 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-yellow-400/30">
                <div className="text-yellow-400 text-lg mb-2">
                  Question {currentLevel} • {prizeAmounts[currentLevel - 1].amount}
                </div>
                <h2 className="text-white text-2xl md:text-3xl font-bold">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer options - Classic diamond layout */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index); // A, B, C, D
                    const isEliminated = eliminatedOptions.includes(option);
                    const isSelected = selectedAnswer === option;
                    const isLocked = lockedAnswer === option;
                    const isCorrect = showResult && option === currentQuestion.correctAnswer;
                    const isWrong = showResult && isLocked && !isCorrect;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isEliminated || lockedAnswer !== null}
                        whileHover={!isEliminated && !lockedAnswer ? { scale: 1.02 } : {}}
                        whileTap={!isEliminated && !lockedAnswer ? { scale: 0.98 } : {}}
                        animate={
                          isLocked && !showResult
                            ? { scale: [1, 1.05, 1] }
                            : {}
                        }
                        transition={
                          isLocked && !showResult
                            ? { duration: 0.5, repeat: Infinity }
                            : {}
                        }
                        className={`
                          relative p-4 rounded-xl transition-all duration-300
                          ${isEliminated ? 'opacity-30 cursor-not-allowed' : ''}
                          ${isSelected && !isLocked ? 'bg-orange-500/80 border-orange-400' : ''}
                          ${isLocked && !showResult ? 'bg-orange-500 border-orange-400 animate-pulse' : ''}
                          ${isCorrect ? 'bg-green-500 border-green-400' : ''}
                          ${isWrong ? 'bg-red-500 border-red-400' : ''}
                          ${!isSelected && !isLocked && !isEliminated ? 'bg-blue-800/50 hover:bg-blue-700/50 border-yellow-400/30' : ''}
                          border-2
                        `}
                      >
                        <div className="flex items-center">
                          <span className="text-yellow-400 font-bold text-xl mr-3">
                            {letter}:
                          </span>
                          <span className="text-white text-lg flex-1 text-left">
                            {option}
                          </span>
                        </div>
                        
                        {/* Audience poll display */}
                        {audiencePoll && audiencePoll[option] && (
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-800 rounded px-2 py-1">
                            <span className="text-yellow-400 text-sm font-bold">
                              {audiencePoll[option]}%
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="flex justify-center space-x-4 mt-8">
                  {/* Before locking answer */}
                  {!lockedAnswer && selectedAnswer && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleFinalAnswer}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-bold text-xl rounded-lg shadow-lg hover:shadow-yellow-400/30 transition-all"
                    >
                      Lock In Answer
                    </motion.button>
                  )}
                  
                  {/* After locking answer - confirmation buttons */}
                  {lockedAnswer && !showResult && (
                    <>
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={confirmFinalAnswer}
                        className="px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-2xl rounded-lg shadow-lg hover:shadow-green-400/30 transition-all"
                      >
                        YES, Final Answer!
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                          setLockedAnswer(null);
                          setIsTimerActive(true);
                          stop(); // Stop the "Is that your final answer?" speech
                          setHostMessage('');
                        }}
                        className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-2xl rounded-lg shadow-lg hover:shadow-red-400/30 transition-all"
                      >
                        NO, Let Me Change
                      </motion.button>
                    </>
                  )}
                  
                  {!lockedAnswer && currentLevel > 1 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleWalkAway}
                      className="px-8 py-3 bg-gray-600/80 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Walk Away
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Lifelines */}
          <div className="flex justify-center space-x-6 mb-6">
            {[
              { key: 'fiftyFifty', icon: Percent, label: '50:50', action: useFiftyFifty },
              { key: 'phoneAFriend', icon: Phone, label: 'Phone', action: usePhoneAFriend },
              { key: 'askAudience', icon: Users, label: 'Audience', action: useAskAudience }
            ].map((lifeline) => (
              <motion.button
                key={lifeline.key}
                onClick={lifeline.action}
                disabled={!lifelines[lifeline.key as keyof typeof lifelines]}
                whileHover={lifelines[lifeline.key as keyof typeof lifelines] ? { scale: 1.1 } : {}}
                whileTap={lifelines[lifeline.key as keyof typeof lifelines] ? { scale: 0.9 } : {}}
                className={`
                  p-4 rounded-full transition-all
                  ${lifelines[lifeline.key as keyof typeof lifelines]
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:shadow-lg hover:shadow-yellow-400/30'
                    : 'bg-gray-600/50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <lifeline.icon className="w-8 h-8 text-blue-900" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right side - Prize ladder */}
        <div className="w-80 bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-lg p-6 border-l border-yellow-400/30">
          <h3 className="text-yellow-400 text-xl font-bold mb-4 text-center">Prize Ladder</h3>
          <div className="space-y-2">
            {[...prizeAmounts].reverse().map((prize) => {
              const isActive = prize.level === currentLevel;
              const isPassed = prize.level < currentLevel;
              const isSafe = prize.safe;
              
              return (
                <motion.div
                  key={prize.level}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`
                    flex items-center justify-between px-4 py-2 rounded-lg transition-all
                    ${isActive ? 'bg-orange-500 text-blue-900 font-bold' : ''}
                    ${isPassed ? 'bg-green-600/30 text-green-400' : ''}
                    ${!isActive && !isPassed ? 'text-white/60' : ''}
                    ${isSafe ? 'border-2 border-yellow-400/50' : ''}
                  `}
                >
                  <span className="text-sm">{prize.level}</span>
                  <span className={`${isActive ? 'text-lg' : ''}`}>
                    {prize.amount}
                  </span>
                  {isSafe && (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border-2 border-yellow-400/50"
            >
              <div className="text-center">
                {winnings === 1000000 ? (
                  <>
                    <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-5xl font-bold text-yellow-400 mb-4">
                      MILLIONAIRE!
                    </h2>
                    <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <DollarSign className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-4xl font-bold text-white mb-4">
                      Game Over
                    </h2>
                  </>
                )}
                
                <p className="text-2xl text-white mb-8">
                  You won: <span className="text-yellow-400 font-bold">${winnings.toLocaleString()}</span>
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-400/30 transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard')}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}