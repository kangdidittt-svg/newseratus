'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LoginCardProps {
  onSubmit: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function LoginCard({ onSubmit, loading, error }: LoginCardProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative bg-[#14161A]/95 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full h-full bg-[#0B0C0E] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-xl text-purple-400 tracking-tight">S</span>
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
            StudioManager
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Creative OS Workspace • Sign in to continue
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#181A20] border border-white/10 rounded-xl text-sm text-[#F5F5F5] placeholder-[#6B7280] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#181A20] border border-white/10 rounded-xl text-sm text-[#F5F5F5] placeholder-[#6B7280] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#F5F5F5] transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-white/5 pt-5">
          <p className="text-xs text-[#9CA3AF]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center space-x-1"
            >
              <span>Create Account</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
