'use client';

import { motion } from 'framer-motion';
import { Play, Pause, MoreHorizontal } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArt: string;
}

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  index: number;
}

export default function TrackCard({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  index
}: TrackCardProps) {
  const handlePlay = () => {
    onPlay(track);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`neuro-card p-4 cursor-pointer group ${
        isCurrentTrack ? 'neuro-card-pressed' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.2, 0.8, 0.2, 1]
      }}
      whileHover={{ y: -2 }}
      onClick={handlePlay}
    >
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <div className="relative">
          <motion.img
            src={track.albumArt}
            alt={track.album}
            className="w-12 h-12 rounded-xl object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Play/Pause Overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-xl flex items-center justify-center transition-all duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-3 h-3 text-gray-800" />
              ) : (
                <Play className="w-3 h-3 text-gray-800 ml-0.5" />
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <motion.h4
            className={`font-medium font-inter truncate ${
              isCurrentTrack
                ? 'text-var(--neuro-accent)'
                : 'text-var(--neuro-text-primary)'
            }`}
            layout
          >
            {track.title}
          </motion.h4>
          <motion.p
            className="text-sm text-var(--neuro-text-secondary) font-inter truncate"
            layout
          >
            {track.artist}
          </motion.p>
        </div>

        {/* Duration */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-var(--neuro-text-muted) font-inter">
            {formatDuration(track.duration)}
          </span>
          
          {/* More Options */}
          <motion.button
            className="neuro-button w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-var(--neuro-text-secondary)" />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar for Current Track */}
      {isCurrentTrack && (
        <motion.div
          className="mt-3 h-1 bg-var(--neuro-bg-dark) rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-var(--neuro-accent) rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '45%' }} // This would be dynamic based on actual progress
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}