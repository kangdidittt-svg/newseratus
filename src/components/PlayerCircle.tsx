'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArt: string;
}

interface PlayerCircleProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function PlayerCircle({
  currentTrack,
  isPlaying,
  currentTime,
  onPlayPause,
  onNext,
  onPrevious
}: PlayerCircleProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentTrack) {
      setProgress((currentTime / currentTrack.duration) * 100);
    }
  }, [currentTime, currentTrack]);

  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Player Circle */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-64 h-64 neuro-progress-ring"
          viewBox="0 0 256 256"
        >
          {/* Background Ring */}
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="var(--neuro-bg-dark)"
            strokeWidth="4"
            opacity="0.3"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="var(--neuro-accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>

        {/* Player Circle */}
        <motion.div
          className="neuro-player-circle w-56 h-56 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Album Art */}
          {currentTrack && (
            <motion.img
              src={currentTrack.albumArt}
              alt={currentTrack.album}
              className="w-48 h-48 rounded-full object-cover"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            />
          )}

          {/* Play/Pause Button Overlay */}
          <motion.button
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full transition-all duration-300"
            onClick={onPlayPause}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="neuro-button w-16 h-16 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-var(--neuro-text-primary)" />
              ) : (
                <Play className="w-8 h-8 text-var(--neuro-text-primary) ml-1" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Track Info */}
      {currentTrack && (
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-var(--neuro-text-primary) font-inter">
            {currentTrack.title}
          </h3>
          <p className="text-var(--neuro-text-secondary) font-inter">
            {currentTrack.artist}
          </p>
          <p className="text-sm text-var(--neuro-text-muted) font-inter">
            {currentTrack.album}
          </p>
        </motion.div>
      )}

      {/* Control Buttons */}
      <motion.div
        className="flex items-center space-x-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <motion.button
          className="neuro-button w-12 h-12 flex items-center justify-center"
          onClick={onPrevious}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SkipBack className="w-5 h-5 text-var(--neuro-text-primary)" />
        </motion.button>

        <motion.button
          className="neuro-button-accent w-16 h-16 flex items-center justify-center"
          onClick={onPlayPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </motion.button>

        <motion.button
          className="neuro-button w-12 h-12 flex items-center justify-center"
          onClick={onNext}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SkipForward className="w-5 h-5 text-var(--neuro-text-primary)" />
        </motion.button>
      </motion.div>

      {/* Time Display */}
      {currentTrack && (
        <motion.div
          className="flex items-center space-x-4 text-sm text-var(--neuro-text-muted) font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
        >
          <span>{formatTime(currentTime)}</span>
          <div className="w-32 h-1 bg-var(--neuro-bg-dark) rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-var(--neuro-accent) rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span>{formatTime(currentTrack.duration)}</span>
        </motion.div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}