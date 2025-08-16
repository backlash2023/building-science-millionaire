'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Trophy, Gift, Calendar, Settings, BarChart, 
  Download, RefreshCw, Power, Eye, EyeOff, Lock 
} from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'prizes' | 'leads' | 'settings'>('overview');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    todayPlayers: 0,
    totalGames: 0,
    averageScore: 0,
    leadsGenerated: 0,
    prizesAwarded: 0,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper auth
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    // TODO: Fetch real stats from API
    setStats({
      totalPlayers: 247,
      todayPlayers: 42,
      totalGames: 523,
      averageScore: 8750,
      leadsGenerated: 189,
      prizesAwarded: 67,
    });
  };

  const exportLeads = () => {
    // TODO: Implement CSV export
    alert('Exporting leads to CSV...');
  };

  const resetDailyLeaderboard = () => {
    if (confirm('Are you sure you want to reset the daily leaderboard?')) {
      // TODO: Call API to reset
      alert('Daily leaderboard reset!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-retrotec-darkRed to-retrotec-red flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-retrotec-red" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-retrotec-red"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-retrotec-red to-retrotec-darkRed text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-retrotec-red to-retrotec-darkRed p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="text-white hover:text-retrotec-yellow transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {(['overview', 'events', 'prizes', 'leads', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-900 text-retrotec-yellow border-b-2 border-retrotec-yellow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-10 h-10 text-retrotec-yellow" />
                  <span className="text-3xl font-bold text-white">{stats.totalPlayers}</span>
                </div>
                <h3 className="text-gray-400">Total Players</h3>
                <p className="text-sm text-green-400 mt-1">+{stats.todayPlayers} today</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-10 h-10 text-retrotec-yellow" />
                  <span className="text-3xl font-bold text-white">{stats.totalGames}</span>
                </div>
                <h3 className="text-gray-400">Games Played</h3>
                <p className="text-sm text-gray-500 mt-1">Avg Score: ${stats.averageScore}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <BarChart className="w-10 h-10 text-retrotec-yellow" />
                  <span className="text-3xl font-bold text-white">{stats.leadsGenerated}</span>
                </div>
                <h3 className="text-gray-400">Leads Generated</h3>
                <p className="text-sm text-gray-500 mt-1">{stats.prizesAwarded} prizes awarded</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={exportLeads}
                  className="flex items-center justify-center gap-2 bg-retrotec-red text-white py-3 px-4 rounded-lg hover:bg-retrotec-darkRed transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export Leads
                </button>
                <button
                  onClick={resetDailyLeaderboard}
                  className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset Daily Board
                </button>
                <button
                  className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  View Reports
                </button>
                <button
                  className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Power className="w-5 h-5" />
                  Emergency Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Event Management</h2>
              <button className="bg-retrotec-yellow text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-retrotec-darkYellow transition-colors">
                + New Event
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Trade Show 2024</h3>
                  <p className="text-sm text-gray-400">March 15-17, 2024 • Las Vegas</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">Active</span>
                  <button className="text-gray-400 hover:text-white">Edit</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prizes' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Prize Configuration</h2>
              <button className="bg-retrotec-yellow text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-retrotec-darkYellow transition-colors">
                + Add Prize Tier
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">Grand Prize (Buildonaire)</h3>
                  <span className="text-retrotec-yellow font-bold">25% Discount</span>
                </div>
                <p className="text-sm text-gray-400">Awarded to players who reach $1,000,000</p>
                <p className="text-sm text-gray-500 mt-1">Inventory: 10 remaining</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">Tier 2 ($250K - $500K)</h3>
                  <span className="text-retrotec-yellow font-bold">Branded Merchandise</span>
                </div>
                <p className="text-sm text-gray-400">T-shirts, hats, and technical guides</p>
                <p className="text-sm text-gray-500 mt-1">Inventory: 45 remaining</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Lead Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportLeads}
                  className="bg-retrotec-red text-white px-4 py-2 rounded-lg font-semibold hover:bg-retrotec-darkRed transition-colors"
                >
                  Export CSV
                </button>
                <button className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                  Sync CRM
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Lead Score</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-3">John Smith</td>
                    <td className="py-3">ABC Corp</td>
                    <td className="py-3">john@abc.com</td>
                    <td className="py-3">$32,000</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-600 text-white text-sm rounded">Hot</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Game Settings</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-gray-400 mb-2">Timer Duration (seconds)</label>
                <input
                  type="number"
                  defaultValue={60}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-retrotec-yellow"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Questions per Game</label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-retrotec-yellow"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">OpenAI Model</label>
                <select className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-retrotec-yellow">
                  <option>gpt-4-turbo-preview</option>
                  <option>gpt-3.5-turbo</option>
                </select>
              </div>
              <button className="bg-retrotec-yellow text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-retrotec-darkYellow transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}