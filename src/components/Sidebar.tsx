'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, FolderOpen, Plus, ChartColumn, Settings } from 'lucide-react';
import Image from 'next/image';
import AddProjectPopover from './AddProjectPopover';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [profileAvatar, setProfileAvatar] = useState<string>('/api/placeholder/150/150');

  // Load profile avatar from API
  useEffect(() => {
    loadProfileAvatar();
    
    // Set up interval to check for profile updates
    const interval = setInterval(() => {
      loadProfileAvatar();
    }, 30000); // Check every 30 seconds
    
    // Listen for storage events (when settings are updated)
    const handleStorageChange = () => {
      loadProfileAvatar();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Add a method to manually refresh avatar (can be called from parent)
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfileAvatar();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadProfileAvatar = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileAvatar(data.settings?.profile?.avatar || '/api/placeholder/150/150');
      }
    } catch (error) {
      console.error('Error loading profile avatar:', error);
    }
  };

  const menuItems = [
    {
      id: 'add-project',
      label: 'Add Project',
      icon: Plus,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
    },
    {
      id: 'monthly-report',
      label: 'Reports',
      icon: ChartColumn,
    },
  ];

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-20 bg-var(--neuro-bg) h-screen flex flex-col items-center justify-center p-4 fixed left-0 top-0 z-10"
      style={{ background: 'var(--neuro-bg)' }}
    >
      {/* Profile Avatar */}
      <motion.div
        variants={itemVariants}
        className="mb-8 flex flex-col items-center"
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src={profileAvatar || '/api/placeholder/150/150'}
            alt="Profile"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
            style={{ borderColor: 'var(--neuro-orange)' }}
            onError={() => {
              // Handle error if needed
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2" 
               style={{ 
                 backgroundColor: 'var(--neuro-success)', 
                 borderColor: 'var(--neuro-bg)' 
               }}>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation Menu */}
      <motion.nav className="flex flex-col items-center">
        <div className="space-y-2 flex flex-col items-center">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={index}
              >
                {item.id === 'add-project' ? (
                  <AddProjectPopover 
                    isActive={isActive}
                    onProjectAdded={() => {
                      // Refresh projects or handle project added
                      setActiveTab('projects');
                    }}
                  />
                ) : (
                  <motion.button
                    className={`w-full flex items-center justify-center p-3 rounded-xl font-inter font-medium transition-all duration-300 ${
                      isActive
                        ? 'neuro-card-pressed'
                        : 'neuro-button hover:neuro-button-hover'
                    }`}
                    style={{
                      color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-primary)'
                    }}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--neuro-orange)' : 'var(--neuro-text-secondary)' }} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.nav>

      {/* Settings Button */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-col items-center"
      >
        <motion.button
          className="neuro-button w-full p-3 flex items-center justify-center rounded-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <Settings className="w-5 h-5" style={{ color: 'var(--neuro-text-secondary)' }} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}