'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

interface LoginCardProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function LoginCard({ onSubmit, loading, error }: LoginCardProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="neuro-card p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div
            className="neuro-card w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--neuro-orange), var(--neuro-orange-light))' }} />
          </motion.div>
          <h1 className="text-2xl font-bold font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
            Welcome Back
          </h1>
          <p className="font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
            Sign in to your account
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="neuro-card-pressed p-4 mb-6 border-l-4 border-red-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-600 text-sm font-inter">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <User className="w-5 h-5" style={{ color: 'var(--neuro-text-secondary)' }} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="neuro-input w-full font-inter relative z-0"
                style={{ 
                  paddingLeft: '3rem', 
                  paddingRight: '1rem', 
                  paddingTop: '0.75rem', 
                  paddingBottom: '0.75rem',
                  ...(focusedField === 'username' ? { boxShadow: '0 0 0 2px var(--neuro-orange-light)' } : {})
                }}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className="w-5 h-5" style={{ color: 'var(--neuro-text-secondary)' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="neuro-input w-full font-inter relative z-0"
                style={{
                  paddingLeft: '3rem',
                  paddingRight: '3rem', 
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  ...(focusedField === 'password' ? { boxShadow: '0 0 0 2px var(--neuro-orange-light)' } : {})
                }}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <motion.button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 z-10"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
                style={{ color: 'var(--neuro-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neuro-orange)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--neuro-text-secondary)'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.button
              type="submit"
              className="neuro-button-orange w-full py-3 px-4 flex items-center justify-center space-x-2 font-medium font-inter"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <p className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <motion.a
              href="/register"
              className="font-medium transition-colors duration-200"
              style={{ color: 'var(--neuro-orange)' }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neuro-orange-light)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--neuro-orange)'}
            >
              Sign up
            </motion.a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}