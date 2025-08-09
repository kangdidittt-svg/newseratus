'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Star } from 'lucide-react';

interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

const EdinburghClock = () => {
  const [time, setTime] = useState<TimeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    period: 'morning'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Edinburgh timezone (GMT+0 in winter, GMT+1 in summer)
      const edinburghTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
      
      const hours = edinburghTime.getHours();
      const minutes = edinburghTime.getMinutes();
      const seconds = edinburghTime.getSeconds();
      
      let period: 'morning' | 'afternoon' | 'evening' | 'night';
      if (hours >= 6 && hours < 12) period = 'morning';
      else if (hours >= 12 && hours < 17) period = 'afternoon';
      else if (hours >= 17 && hours < 21) period = 'evening';
      else period = 'night';
      
      setTime({ hours, minutes, seconds, period });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBackgroundGradient = () => {
    switch (time.period) {
      case 'morning':
        return 'from-blue-50 via-indigo-50 to-purple-50';
      case 'afternoon':
        return 'from-gray-50 via-blue-50 to-indigo-50';
      case 'evening':
        return 'from-purple-100 via-indigo-100 to-blue-100';
      case 'night':
        return 'from-gray-800 via-gray-900 to-black';
      default:
        return 'from-gray-50 to-blue-50';
    }
  };

  const getTextColor = () => {
    switch (time.period) {
      case 'morning':
        return 'text-gray-800';
      case 'afternoon':
        return 'text-gray-800';
      case 'evening':
        return 'text-gray-700';
      case 'night':
        return 'text-gray-100';
      default:
        return 'text-gray-800';
    }
  };

  const getClockFaceColor = () => {
    switch (time.period) {
      case 'night':
        return 'bg-gray-100/95';
      default:
        return 'bg-white/95';
    }
  };

  const getPeriodIcon = () => {
    switch (time.period) {
      case 'morning':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'afternoon':
        return <Sun className="w-5 h-5 text-yellow-600" />;
      case 'evening':
        return <Sun className="w-5 h-5 text-orange-500" />;
      case 'night':
        return <Moon className="w-5 h-5 text-orange-300" />;
    }
  };

  const hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
  const minuteAngle = time.minutes * 6;
  const secondAngle = time.seconds * 6;

  const BackgroundElements = () => {
    switch (time.period) {
      case 'morning':
        return (
          <>
            {/* Subtle morning accent */}
            <motion.div 
              className="absolute top-4 right-6 w-3 h-3 bg-yellow-400/60 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </>
        );
      case 'afternoon':
        return (
          <>
            {/* Subtle afternoon accent */}
            <motion.div 
              className="absolute top-3 right-5 w-4 h-4 bg-blue-400/50 rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </>
        );
      case 'evening':
        return (
          <>
            {/* Subtle evening accent */}
            <motion.div 
              className="absolute top-4 right-6 w-3 h-3 bg-purple-400/60 rounded-full"
              animate={{ 
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </>
        );
      case 'night':
        return (
          <>
            {/* Minimalist moon */}
            <motion.div 
              className="absolute top-4 right-6 w-4 h-4 bg-yellow-200/80 rounded-full relative overflow-hidden"
              animate={{ 
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-gray-800 rounded-full" />
            </motion.div>
            {/* Subtle stars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-300 rounded-full"
                style={{
                  top: `${25 + i * 20}%`,
                  left: `${15 + i * 15}%`
                }}
                animate={{ 
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ 
                  duration: 3 + i, 
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className={`relative overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-gradient-to-br ${getBackgroundGradient()}`}
      style={{ height: 'fit-content' }}
    >
      {/* Background Elements */}
      <BackgroundElements />
      
      {/* Clock Container */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>Edinburgh Time</h3>
          <div className="flex items-center space-x-2">
            {getPeriodIcon()}
            <span className={`text-sm font-medium ${getTextColor()} capitalize`}>
              {time.period}
            </span>
          </div>
        </div>
        
        {/* Analog Clock */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Clock Face */}
            <div className={`absolute inset-0 ${getClockFaceColor()} backdrop-blur-sm rounded-full border-4 border-gray-300 shadow-lg`}>
              {/* Hour Markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`hour-marker-${i}`}
                  className="absolute w-0.5 h-4 bg-gray-600"
                  style={{
                    top: '8px',
                    left: '50%',
                    transformOrigin: '50% 56px',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`
                  }}
                />
              ))}
              
              {/* Hour Hand */}
              <motion.div
                className="absolute w-1 bg-gray-800 rounded-full origin-bottom"
                style={{
                  height: '32px',
                  left: '50%',
                  bottom: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) rotate(${hourAngle}deg)`
                }}
                animate={{ rotate: hourAngle }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              />
              
              {/* Minute Hand */}
              <motion.div
                className="absolute w-0.5 bg-gray-700 rounded-full origin-bottom"
                style={{
                  height: '44px',
                  left: '50%',
                  bottom: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) rotate(${minuteAngle}deg)`
                }}
                animate={{ rotate: minuteAngle }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              />
              
              {/* Second Hand */}
              <motion.div
                className="absolute w-px bg-red-500 rounded-full origin-bottom"
                style={{
                  height: '48px',
                  left: '50%',
                  bottom: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) rotate(${secondAngle}deg)`
                }}
                animate={{ rotate: secondAngle }}
                transition={{ type: 'spring', stiffness: 200, damping: 5 }}
              />
              
              {/* Center Dot */}
              <div className="absolute w-3 h-3 bg-gray-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        {/* Digital Time Display */}
        <div className="text-center mt-4">
          <div className={`text-2xl font-bold ${getTextColor()}`}>
            {time.hours.toString().padStart(2, '0')}:
            {time.minutes.toString().padStart(2, '0')}:
            {time.seconds.toString().padStart(2, '0')}
          </div>
          <div className={`text-sm ${getTextColor()} opacity-80 mt-1`}>
            {new Date().toLocaleDateString('en-GB', { 
              timeZone: 'Europe/London',
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EdinburghClock;