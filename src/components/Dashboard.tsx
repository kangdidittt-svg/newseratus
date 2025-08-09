'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlayerCircle from './PlayerCircle';
import DownloadList from './DownloadList';
import EdinburghClock from './EdinburghClock';

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

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '3',
    title: 'What A Man Gotta Do',
    artist: 'Jonas Brothers',
    album: 'Single',
    duration: 177,
    albumArt: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '4',
    title: 'You Should Be Sad',
    artist: 'Halsey',
    album: 'Manic',
    duration: 206,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '5',
    title: 'So Hot For Sarah Smith',
    artist: 'Various Artists',
    album: 'Compilation',
    duration: 189,
    albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '6',
    title: 'Boss Bitch',
    artist: 'Doja Cat',
    album: 'Hot Pink',
    duration: 178,
    albumArt: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '7',
    title: 'Dancing with a Stranger',
    artist: 'Sam Smith',
    album: 'Single',
    duration: 191,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face'
  },
  {
    id: '8',
    title: 'Underdog',
    artist: 'Alicia Keys',
    album: 'ALICIA',
    duration: 213,
    albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face'
  }
];

const mockDownloads: DownloadItem[] = [
  {
    id: '1',
    track: mockTracks[0],
    status: 'completed',
    progress: 100,
    downloadedAt: '2024-01-15'
  },
  {
    id: '2',
    track: mockTracks[1],
    status: 'downloading',
    progress: 65
  },
  {
    id: '3',
    track: mockTracks[2],
    status: 'pending',
    progress: 0
  }
];

export default function Dashboard() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks] = useState<Track[]>(mockTracks);
  const [downloads] = useState<DownloadItem[]>(mockDownloads);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrack) {
      const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrack(tracks[nextIndex]);
      setCurrentTime(0);
    }
  };

  const handlePrevious = () => {
    if (currentTrack) {
      const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      setCurrentTrack(tracks[prevIndex]);
      setCurrentTime(0);
    }
  };

  const handleTrackPlay = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-var(--neuro-bg) flex" style={{ background: 'var(--neuro-bg)' }}>
      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Edinburgh Clock */}
          <motion.div
            className="neuro-card p-6 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-var(--neuro-text-primary) font-inter mb-2">
                  {currentTrack ? currentTrack.title : 'Blinding Lights'}
                </h1>
                <p className="text-var(--neuro-text-secondary) font-inter">
                  {currentTrack ? `${currentTrack.artist} • ${currentTrack.album}` : 'The Weeknd • After Hours'}
                </p>
              </div>
              <div className="text-right">
                <EdinburghClock />
              </div>
            </div>
          </motion.div>

          {/* Player Section */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PlayerCircle
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            {/* Intentions Card */}
            <motion.div
              className="neuro-card p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-3 h-3 bg-pink-400 rounded-full" />
                <h3 className="text-lg font-semibold text-var(--neuro-text-primary) font-inter">
                  Intentions
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </div>
                <div className="w-full h-8 bg-var(--neuro-bg-dark) rounded-lg flex items-center px-3">
                  <div className="w-6 h-6 bg-var(--neuro-accent) rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-var(--neuro-text-primary) font-inter">01</p>
                <p className="text-sm text-var(--neuro-text-muted) font-inter">Curated collections</p>
              </div>
            </motion.div>

            {/* Play Card */}
            <motion.div
              className="neuro-card p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <h3 className="text-lg font-semibold text-var(--neuro-text-primary) font-inter">
                  Play
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </div>
                <div className="w-full h-8 bg-var(--neuro-bg-dark) rounded-lg flex items-center px-3">
                  <div className="w-6 h-6 bg-var(--neuro-accent) rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-var(--neuro-text-primary) font-inter">02</p>
                <p className="text-sm text-var(--neuro-text-muted) font-inter">Play collections</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Sidebar - Download List */}
      <div className="w-96 p-6 border-l border-var(--neuro-bg-dark)">
        <DownloadList
          tracks={tracks}
          downloads={downloads}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackPlay={handleTrackPlay}
        />
      </div>
    </div>
  );
}