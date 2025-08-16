'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building2, Briefcase, Sparkles } from 'lucide-react';

export default function RegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    marketingOptIn: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Register the player
      const response = await fetch('/api/players/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store player data in sessionStorage
        sessionStorage.setItem('player', JSON.stringify({
          id: data.id,
          name: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          email: formData.email
        }));
        
        // Navigate to welcome screen
        router.push('/welcome');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-20"
            initial={{ 
              x: Math.random() * 1920, 
              y: Math.random() * 1080 
            }}
            animate={{
              x: Math.random() * 1920,
              y: Math.random() * 1080,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </div>

      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text">
              WHO WANTS TO BE A
            </span>
          </h1>
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-transparent bg-clip-text animate-pulse">
              BUILDONAIRE!
            </span>
          </h1>
          <p className="text-white/80 text-xl mt-4">
            Test your building science knowledge and win up to $1,000,000!
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-yellow-400/20"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
            <h2 className="text-3xl font-bold text-white">Enter the Hot Seat!</h2>
            <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/50 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-blue-800/50 border ${
                      errors.firstName ? 'border-red-500' : 'border-yellow-400/30'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-blue-800/70 transition-all`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/50 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-blue-800/50 border ${
                      errors.lastName ? 'border-red-500' : 'border-yellow-400/30'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-blue-800/70 transition-all`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-yellow-400 text-sm font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/50 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-blue-800/50 border ${
                    errors.email ? 'border-red-500' : 'border-yellow-400/30'
                  } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-blue-800/70 transition-all`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-2">
                  Company (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/50 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-yellow-400/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-blue-800/70 transition-all"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-yellow-400 text-sm font-medium mb-2">
                  Job Title (Optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400/50 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-blue-800/50 border border-yellow-400/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-blue-800/70 transition-all"
                    placeholder="Building Science Expert"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Opt-in */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketing"
                checked={formData.marketingOptIn}
                onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
                className="w-5 h-5 bg-blue-800/50 border-yellow-400/30 rounded text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0"
              />
              <label htmlFor="marketing" className="ml-3 text-white/80 text-sm">
                I&apos;d like to receive updates about building science and future games
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-bold text-xl rounded-lg shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-3 border-blue-900 border-t-transparent rounded-full mr-2"
                  />
                  Entering the Hot Seat...
                </span>
              ) : (
                'ENTER THE HOT SEAT!'
              )}
            </motion.button>
          </form>

          <p className="text-center text-white/60 text-sm mt-6">
            By playing, you agree to our terms and conditions
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}