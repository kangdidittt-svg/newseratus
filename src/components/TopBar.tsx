'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SwipeableNotification from './SwipeableNotification';
import Image from 'next/image';
import ProfilePopover from './ProfilePopover';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

interface TopBarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNavigateToSettings?: () => void;
}

export default function TopBar({ onNavigateToSettings }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string>('/api/placeholder/150/150');
  
  // Use realtime notifications hook
  const {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading: isLoadingNotifications,
    markAsRead
  } = useRealtimeNotifications();

  // Delete notification function
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Notification deleted successfully');
        // Remove notification from local state instead of refreshing
      } else {
        console.error('❌ Failed to delete notification');
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Connection status indicator
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return { icon: Wifi, color: 'var(--neuro-green)', text: 'Connected' };
      case 'connecting':
        return { icon: WifiOff, color: 'var(--neuro-orange)', text: 'Connecting...' };
      case 'reconnecting':
        return { icon: WifiOff, color: 'var(--neuro-orange)', text: 'Reconnecting...' };
      case 'disconnected':
      default:
        return { icon: WifiOff, color: 'var(--neuro-red)', text: 'Disconnected' };
    }
  };

  const connectionDisplay = getConnectionStatusDisplay();



  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });



  // Load profile avatar from API
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

  // Load profile avatar on component mount
  useEffect(() => {
    loadProfileAvatar();
    
    // Set up interval to check for profile updates
    const profileInterval = setInterval(() => {
      loadProfileAvatar();
    }, 30000);
    
    // Listen for storage events (when settings are updated)
    const handleStorageChange = () => {
      loadProfileAvatar();
    };
    
    const handleProfileUpdate = () => {
      loadProfileAvatar();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
       clearInterval(profileInterval);
       window.removeEventListener('storage', handleStorageChange);
       window.removeEventListener('profileUpdated', handleProfileUpdate);
     };
   }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-4 flex items-center justify-between sticky top-0 z-40"
      style={{ 
        background: 'var(--neuro-bg)',
        borderBottom: '1px solid var(--neuro-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle - Removed as sidebar is always visible */}

        {/* Date Display */}
        <div className="hidden md:block">
          <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Today</p>
          <p className="text-lg font-semibold" style={{ color: 'var(--neuro-orange)' }}>{formattedDate}</p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <motion.div
          className="relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 z-10 pointer-events-none" style={{ color: 'var(--neuro-text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neuro-input w-full transition-all duration-200 relative z-0"
            style={{
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }}
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="neuro-button p-2 transition-colors relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Notifications (${connectionDisplay.text})`}
          >
            <div className="relative">
              <Bell className="h-5 w-5" style={{ color: 'var(--neuro-text-primary)' }} />
              {/* Connection status indicator */}
              <div 
                className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: connectionDisplay.color }}
                title={connectionDisplay.text}
              />
            </div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--neuro-orange)' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="neuro-card absolute right-0 mt-2 w-80 py-2 z-50"
              >
              <div className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: '1px solid var(--neuro-border)' }}>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead()}
                    className="text-xs font-medium"
                    style={{ color: 'var(--neuro-orange)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: 'var(--neuro-orange)' }}></div>
                    <p className="text-sm mt-2" style={{ color: 'var(--neuro-text-secondary)' }}>Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--neuro-text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <SwipeableNotification
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      onDelete={() => deleteNotification(notification.id)}
                    />
                  ))
                )}
              </div>
              <div className="px-4 py-2" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <button 
                    onClick={() => {
                      markAsRead();
                      setShowNotifications(false);
                    }}
                    className="text-sm py-2 px-3 rounded-lg transition-colors flex-1 mr-2"
                    style={{
                      color: 'var(--neuro-text-secondary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--neuro-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Mark all as read
                  </button>

                 </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar */}
        <ProfilePopover 
          userName="User" 
          userEmail="user@example.com"
          onNavigateToSettings={onNavigateToSettings}
        >
          <div className="relative">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={profileAvatar || '/api/placeholder/150/150'}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 shadow-md cursor-pointer"
                style={{ borderColor: 'var(--neuro-orange)' }}
                onError={() => {
                  // Handle error if needed
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2" 
                   style={{ 
                     backgroundColor: 'var(--neuro-success)', 
                     borderColor: 'var(--neuro-bg)' 
                   }}>
              </div>
            </motion.div>
          </div>
        </ProfilePopover>

      </div>

      {/* Click outside handlers */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
          }}
        />
      )}
    </motion.div>
  );
}