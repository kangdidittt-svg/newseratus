'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

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
  
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted) return;
    
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
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
  }, [isMounted]);

  const getBackgroundStyle = () => {
    switch (time.period) {
      case 'morning':
        return {
          background: 'linear-gradient(135deg, var(--neuro-bg), var(--neuro-bg-light))',
          color: 'var(--neuro-text-primary)'
        };
      case 'afternoon':
        return {
          background: 'linear-gradient(135deg, var(--neuro-bg-secondary), var(--neuro-bg))',
          color: 'var(--neuro-text-primary)'
        };
      case 'evening':
        return {
          background: 'linear-gradient(135deg, var(--neuro-bg-dark), var(--neuro-bg-secondary))',
          color: 'var(--neuro-text-primary)'
        };
      case 'night':
        return {
          background: 'linear-gradient(135deg, #2d3748, #1a202c)',
          color: 'var(--neuro-text-light)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, var(--neuro-bg), var(--neuro-bg-light))',
          color: 'var(--neuro-text-primary)'
        };
    }
  };

  const getTextColorClass = () => {
    switch (time.period) {
      case 'night':
        return 'text-gray-100';
      default:
        return '';
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
      className={`relative overflow-hidden w-full max-w-full mx-auto`}
      style={{ 
        minHeight: 'fit-content',
        borderRadius: 'var(--neuro-radius-lg)',
        boxShadow: 'var(--neuro-shadow-outset)',
        border: '1px solid var(--neuro-border)',
        ...getBackgroundStyle()
      }}
    >
      {/* Background Elements */}
      <BackgroundElements />
      
      {/* Clock Container */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-semibold ${getTextColorClass()}`} style={{ color: getBackgroundStyle().color }}>Edinburgh Time</h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {getPeriodIcon()}
            <span className={`text-xs sm:text-sm font-medium ${getTextColorClass()} capitalize`} style={{ color: getBackgroundStyle().color }}>
              {time.period}
            </span>
          </div>
        </div>
        
        {/* Analog Clock */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            {/* Clock Face */}
            <div className={`absolute inset-0 ${getClockFaceColor()} backdrop-blur-sm rounded-full border-2 sm:border-4 border-gray-300 shadow-lg`}>
              {/* Hour Markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`hour-marker-${i}`}
                  className="absolute w-0.5 h-3 sm:h-4 bg-gray-600"
                  style={{
                    top: isSmallScreen ? '6px' : '8px',
                    left: '50%',
                    transformOrigin: isSmallScreen ? '50% 42px' : '50% 56px',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`
                  }}
                />
              ))}
              
              {/* Hour Hand */}
              <motion.div
                className="absolute w-0.5 sm:w-1 bg-gray-800 rounded-full origin-bottom"
                style={{
                  height: isSmallScreen ? '24px' : '32px',
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
                className="absolute w-px sm:w-0.5 bg-gray-700 rounded-full origin-bottom"
                style={{
                  height: isSmallScreen ? '33px' : '44px',
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
                  height: isSmallScreen ? '36px' : '48px',
                  left: '50%',
                  bottom: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) rotate(${secondAngle}deg)`
                }}
                animate={{ rotate: secondAngle }}
                transition={{ type: 'spring', stiffness: 200, damping: 5 }}
              />
              
              {/* Center Dot */}
              <div 
                className="absolute bg-gray-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: isSmallScreen ? '8px' : '12px',
                  height: isSmallScreen ? '8px' : '12px'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Digital Time Display */}
        <div className="text-center mt-3 sm:mt-4">
          <div className={`text-xl sm:text-2xl font-bold ${getTextColorClass()}`} style={{ color: getBackgroundStyle().color }}>
            {time.hours.toString().padStart(2, '0')}:
            {time.minutes.toString().padStart(2, '0')}:
            {time.seconds.toString().padStart(2, '0')}
          </div>
          <div className={`text-xs sm:text-sm ${getTextColorClass()} opacity-80 mt-1`} style={{ color: getBackgroundStyle().color }}>
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