'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  _id: string;
  title: string;
  status: string;
  deadline?: string;
  createdAt: string;
}

interface RobotAssistantProps {
  projects: Project[];
  onReminder: (type: 'break' | 'water' | 'project') => void;
}

const RobotAssistant: React.FC<RobotAssistantProps> = ({ projects, onReminder }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNotification, setShowNotification] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [autoActionCounter, setAutoActionCounter] = useState(0);

  const userName = user?.username || 'Teman';

  const motivationalMessages = useMemo(() => [
    `Semangat ${userName}! Kamu bisa menyelesaikan proyek ini! 💪`,
    `Tetap fokus dan produktif ${userName}! ⚡`,
    `${userName} sudah bekerja keras hari ini! 🌟`,
    `Jangan lupa istirahat sejenak ya ${userName}! 😊`,
    `Waktunya minum air putih ${userName}! 💧`,
    `Progress kecil tetap progress ${userName}! 🚀`,
    `Konsistensi adalah kunci sukses ${userName}! 🔑`,
    `${userName} lebih kuat dari yang kamu kira! 💎`
  ], [userName]);

  const getProjectStats = useCallback(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
    
    // Projects created in the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newProjects = projects.filter(p => new Date(p.createdAt) > weekAgo).length;
    
    return { activeProjects, completedProjects, onHoldProjects, newProjects };
  }, [projects]);

  const getProjectReminders = useCallback(() => {
    const stats = getProjectStats();
    const reminders = [];
    
    if (stats.activeProjects > 0) {
      reminders.push(`${userName}, kamu punya ${stats.activeProjects} proyek yang belum selesai! 📋`);
    }
    
    if (stats.newProjects > 0) {
      reminders.push(`${userName}, ada ${stats.newProjects} proyek baru minggu ini! 🆕`);
    }
    
    if (stats.onHoldProjects > 0) {
      reminders.push(`${userName}, ${stats.onHoldProjects} proyek sedang tertunda, perlu ditinjau! ⏸️`);
    }
    
    if (stats.completedProjects > 0) {
      reminders.push(`Hebat ${userName}! ${stats.completedProjects} proyek sudah selesai! ✅`);
    }
    
    // Default reminders
    reminders.push(
      `${userName}, jangan lupa cek deadline proyek ya! ⏰`,
      `Saatnya update progress proyek ${userName}! 📈`,
      `Review kualitas pekerjaan yuk ${userName}! ✨`,
      `Komunikasi dengan klien sudah optimal ${userName}? 📞`
    );
    
    return reminders;
  }, [userName, getProjectStats]);

  const showRandomReminder = useCallback(() => {
    const projectReminders = getProjectReminders();
    const allMessages = [...motivationalMessages, ...projectReminders];
    const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
    setCurrentMessage(randomMessage);
    setIsActive(true);
    
    setTimeout(() => setIsActive(false), 3000);
    
    // Trigger reminder callback
    const reminderTypes: ('break' | 'water' | 'project')[] = ['break', 'water', 'project'];
    const randomType = reminderTypes[Math.floor(Math.random() * reminderTypes.length)];
    onReminder(randomType);
  }, [getProjectReminders, motivationalMessages, onReminder]);

  const performAutoAction = useCallback(() => {
    setAutoActionCounter(prev => prev + 1);
    setIsActive(true);
    
    // Show notification occasionally (every 4th auto action)
    if (autoActionCounter % 4 === 0) {
      showRandomReminder();
    }
    
    setTimeout(() => setIsActive(false), 2000);
  }, [autoActionCounter, showRandomReminder]);

  // Auto action every 15-25 seconds (slower)
  useEffect(() => {
    const getRandomInterval = () => Math.random() * 10000 + 15000; // 15-25 seconds
    
    const scheduleNextAction = () => {
      setTimeout(() => {
        performAutoAction();
        scheduleNextAction();
      }, getRandomInterval());
    };
    
    scheduleNextAction();
  }, [performAutoAction]);

  // Reminder system every 8 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      if (timeSinceLastInteraction > 480000) { // 8 minutes
        showRandomReminder();
        setLastInteraction(now);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lastInteraction, showRandomReminder]);

  const handleRobotClick = () => {
    setIsActive(true);
    showRandomReminder();
    setLastInteraction(Date.now());
    
    setTimeout(() => setIsActive(false), 2000);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Robot Character */}
      <motion.div
        className="relative cursor-pointer"
        onClick={handleRobotClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          y: isActive ? [-3, 3, -3] : [-1.5, 1.5, -1.5],
          rotate: isActive ? [-2, 2, -2] : [-0.8, 0.8, -0.8]
        }}
        transition={{
          duration: isActive ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        tabIndex={0}
      >
        {/* Main Robot Body - Inspired by reference image */}
         <div className="relative">
           {/* Robot Head - Yellow with black screen */}
           <motion.div 
             className="w-32 h-28 rounded-3xl neuro-card relative overflow-hidden mx-auto"
             style={{ 
               background: 'linear-gradient(135deg, #FFD700, #FFA500)',
               boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.1), inset -3px -3px 8px rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.1)'
             }}
             animate={isActive ? { scale: [1, 1.05, 1] } : {}}
             transition={{ duration: 0.8, repeat: Infinity }}
           >
             {/* Antenna with yellow ball */}
             <motion.div 
               className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2 h-6 rounded-full"
               style={{ backgroundColor: '#333' }}
               animate={isActive ? { height: [24, 28, 24] } : {}}
               transition={{ duration: 1, repeat: Infinity }}
             >
               <motion.div 
                 className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full"
                 style={{ backgroundColor: '#FFD700', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                 animate={isActive ? { scale: [1, 1.2, 1] } : { scale: [0.9, 1, 0.9] }}
                 transition={{ duration: 2, repeat: Infinity }}
               />
             </motion.div>
             
             {/* Black screen with white eyes */}
             <div 
               className="w-24 h-16 rounded-2xl mx-auto mt-4 relative flex items-center justify-center"
               style={{ 
                 backgroundColor: '#1a1a1a',
                 boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.8), inset -2px -2px 6px rgba(255,255,255,0.1)'
               }}
             >
               {/* White glowing eyes */}
               <div className="flex space-x-4">
                 <motion.div 
                   className="w-6 h-6 rounded-full relative"
                   style={{ 
                     backgroundColor: '#ffffff',
                     boxShadow: '0 0 12px rgba(255,255,255,0.8), inset 0 0 4px rgba(200,200,200,0.5)'
                   }}
                   animate={isActive ? { scale: [1, 1.1, 1] } : { opacity: [0.9, 1, 0.9] }}
                   transition={{ duration: 0.8, repeat: Infinity }}
                 >
                   {/* Eye pupil/reflection */}
                   <motion.div 
                     className="absolute top-1 left-1 w-2 h-2 rounded-full"
                     style={{ backgroundColor: 'rgba(200,200,200,0.3)' }}
                     animate={{ rotate: isActive ? [0, 360] : [0, 180, 0] }}
                     transition={{ duration: 3, repeat: Infinity }}
                   />
                 </motion.div>
                 <motion.div 
                   className="w-6 h-6 rounded-full relative"
                   style={{ 
                     backgroundColor: '#ffffff',
                     boxShadow: '0 0 12px rgba(255,255,255,0.8), inset 0 0 4px rgba(200,200,200,0.5)'
                   }}
                   animate={isActive ? { scale: [1, 1.1, 1] } : { opacity: [0.9, 1, 0.9] }}
                   transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
                 >
                   {/* Eye pupil/reflection */}
                   <motion.div 
                     className="absolute top-1 left-1 w-2 h-2 rounded-full"
                     style={{ backgroundColor: 'rgba(200,200,200,0.3)' }}
                     animate={{ rotate: isActive ? [0, 360] : [0, 180, 0] }}
                     transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
                   />
                 </motion.div>
               </div>
             </div>
           </motion.div>
           
           {/* Robot Body - Yellow rounded */}
           <motion.div 
             className="w-24 h-20 rounded-2xl neuro-card-pressed relative mt-2 mx-auto"
             style={{ 
               background: 'linear-gradient(135deg, #FFD700, #FFA500)',
               boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.1), inset -2px -2px 6px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.1)'
             }}
           >
             {/* Control buttons on chest */}
             <div className="flex justify-center items-center pt-3 space-x-2">
               <motion.div 
                 className="w-3 h-3 rounded-full"
                 style={{ backgroundColor: '#00ff00', boxShadow: '0 0 6px rgba(0,255,0,0.5)' }}
                 animate={{ opacity: [0.6, 1, 0.6] }}
                 transition={{ duration: 1.2, repeat: Infinity }}
               />
               <motion.div 
                 className="w-3 h-3 rounded-full"
                 style={{ backgroundColor: '#ff4444', boxShadow: '0 0 6px rgba(255,68,68,0.5)' }}
                 animate={{ opacity: [0.6, 1, 0.6] }}
                 transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
               />
               <motion.div 
                 className="w-3 h-3 rounded-full"
                 style={{ backgroundColor: '#4444ff', boxShadow: '0 0 6px rgba(68,68,255,0.5)' }}
                 animate={{ opacity: [0.6, 1, 0.6] }}
                 transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
               />
             </div>
             
             {/* Arms - Black/gray with yellow accents */}
             <motion.div 
               className="absolute -left-4 top-4 w-8 h-4 rounded-full flex items-center justify-center"
               style={{ 
                 background: 'linear-gradient(135deg, #666, #333)',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
               }}
               animate={{ rotate: isActive ? [-20, 20, -20] : [-8, 8, -8] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               {/* Hand/claw */}
               <div 
                 className="w-3 h-3 rounded-full"
                 style={{ backgroundColor: '#FFD700' }}
               />
             </motion.div>
             <motion.div 
               className="absolute -right-4 top-4 w-8 h-4 rounded-full flex items-center justify-center"
               style={{ 
                 background: 'linear-gradient(135deg, #666, #333)',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
               }}
               animate={{ rotate: isActive ? [20, -20, 20] : [8, -8, 8] }}
               transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
             >
               {/* Hand/claw */}
               <div 
                 className="w-3 h-3 rounded-full"
                 style={{ backgroundColor: '#FFD700' }}
               />
             </motion.div>
           </motion.div>
         </div>
      </motion.div>



      {/* Notification Bubble */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -15 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div 
              className="neuro-card px-4 py-3 rounded-xl shadow-xl max-w-56 text-center relative"
              style={{ 
                background: 'linear-gradient(135deg, var(--neuro-bg-primary), var(--neuro-bg-secondary))',
                border: '1px solid var(--neuro-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <p 
                className="text-sm font-inter leading-relaxed font-medium"
                style={{ color: 'var(--neuro-text-primary)' }}
              >
                {currentMessage}
              </p>
              {/* Enhanced speech bubble arrow */}
              <div 
                className="absolute top-full left-1/2 transform -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid var(--neuro-bg-primary)'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RobotAssistant;