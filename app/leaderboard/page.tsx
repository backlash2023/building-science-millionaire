'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Calendar, Users, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  company: string;
  score: number;
  prizeLevel: string;
  questionsAnswered: number;
  correctAnswers: number;
  gameTime: number;
  date: string;
  won: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'all-time'>('daily');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchLeaderboard, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, autoRefresh]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?type=${selectedPeriod}&limit=20`);
      const data = await response.json();
      // Ensure we always have an array, even if the API returns undefined or no leaderboard property
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Set empty array on error to prevent undefined errors
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-retrotec-yellow" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-retrotec-darkRed to-retrotec-red">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-retrotec-yellow mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-200 text-lg">
            Top Building Science Champions
          </p>
        </motion.div>

        {/* Period Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {(['daily', 'weekly', 'all-time'] as const).map((period) => (
            <motion.button
              key={period}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedPeriod === period
                  ? 'bg-retrotec-yellow text-gray-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="flex items-center gap-2">
                {period === 'daily' && <Calendar className="w-4 h-4" />}
                {period === 'weekly' && <Clock className="w-4 h-4" />}
                {period === 'all-time' && <Trophy className="w-4 h-4" />}
                {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Auto-refresh toggle */}
        <div className="flex justify-center mb-6">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-retrotec-yellow focus:ring-retrotec-yellow"
            />
            <span className="text-sm">Auto-refresh every 30 seconds</span>
          </label>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center text-white">
                <div className="animate-pulse">Loading leaderboard...</div>
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="p-12 text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl">No games played yet</p>
                <p className="text-gray-300 mt-2">Be the first to play and claim the top spot!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr className="text-retrotec-yellow">
                      <th className="px-6 py-4 text-left">Rank</th>
                      <th className="px-6 py-4 text-left">Player</th>
                      <th className="px-6 py-4 text-left">Company</th>
                      <th className="px-6 py-4 text-center">Prize Won</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">Accuracy</th>
                      <th className="px-6 py-4 text-center">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <motion.tr
                        key={`${entry.playerName}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-t border-white/10 ${
                          entry.won ? 'bg-retrotec-yellow/10' : ''
                        } ${
                          index < 3 ? 'text-white font-semibold' : 'text-gray-300'
                        } hover:bg-white/5 transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                            {entry.won && (
                              <span className="text-retrotec-yellow text-xs">MILLIONAIRE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">{entry.playerName}</td>
                        <td className="px-6 py-4 text-sm">{entry.company}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${
                            entry.won ? 'text-retrotec-yellow' : 'text-white'
                          }`}>
                            {entry.prizeLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{entry.score.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>
                              {entry.correctAnswers}/{entry.questionsAnswered}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({Math.round((entry.correctAnswers / entry.questionsAnswered) * 100)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(entry.gameTime)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all"
          >
            Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  );
}