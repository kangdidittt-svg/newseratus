'use client';

import { motion } from 'framer-motion';
import { Download, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import TrackCard from './TrackCard';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArt: string;
}

interface DownloadItem {
  id: string;
  track: Track;
  status: 'pending' | 'downloading' | 'completed';
  progress: number;
  downloadedAt?: string;
}

interface DownloadListProps {
  tracks: Track[];
  downloads: DownloadItem[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackPlay: (track: Track) => void;
}

export default function DownloadList({
  tracks,
  downloads,
  currentTrack,
  isPlaying,
  onTrackPlay
}: DownloadListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        className="neuro-card p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-var(--neuro-text-primary) font-inter">
            Download
          </h2>
          <motion.div
            className="neuro-button w-10 h-10 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Download className="w-5 h-5 text-var(--neuro-text-secondary)" />
          </motion.div>
        </div>
        
        {/* Download Stats */}
        <div className="flex items-center space-x-4 text-sm text-var(--neuro-text-muted) font-inter">
          <span>{downloads.filter(d => d.status === 'completed').length} completed</span>
          <span>•</span>
          <span>{downloads.filter(d => d.status === 'downloading').length} downloading</span>
          <span>•</span>
          <span>{downloads.filter(d => d.status === 'pending').length} pending</span>
        </div>
      </motion.div>

      {/* Download Queue */}
      {downloads.length > 0 && (
        <motion.div
          className="neuro-card p-4 mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-var(--neuro-text-primary) font-inter mb-4">
            Queue
          </h3>
          <div className="space-y-3">
            {downloads.slice(0, 3).map((download, index) => (
              <motion.div
                key={download.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-var(--neuro-bg-light)"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Image
                  src={download.track.albumArt}
                  alt={download.track.album}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-var(--neuro-text-primary) font-inter truncate">
                    {download.track.title}
                  </p>
                  <p className="text-xs text-var(--neuro-text-muted) font-inter truncate">
                    {download.track.artist}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {download.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {download.status === 'downloading' && (
                    <motion.div
                      className="w-4 h-4 border-2 border-var(--neuro-accent) border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  {download.status === 'pending' && (
                    <Clock className="w-4 h-4 text-var(--neuro-text-muted)" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Track List */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="neuro-card p-4 h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-var(--neuro-text-primary) font-inter">
              Playlist
            </h3>
            <span className="text-sm text-var(--neuro-text-muted) font-inter">
              {tracks.length} songs
            </span>
          </div>
          
          <motion.div
            className="flex-1 overflow-y-auto space-y-3 pr-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tracks.map((track, index) => (
              <motion.div key={track.id} variants={itemVariants}>
                <TrackCard
                  track={track}
                  isPlaying={isPlaying}
                  isCurrentTrack={currentTrack?.id === track.id}
                  onPlay={onTrackPlay}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}