'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProfilePopover from './ProfilePopover';
import NotificationPopover from './NotificationPopover';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { setGlobalNotificationRefresh } from '../hooks/useNotificationRefresh';

interface TopBarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function TopBar({}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string>('/api/placeholder/150/150');
  const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
  
  // Use realtime notifications hook
  const {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading: isLoadingNotifications,
    markAsRead,
    refreshNotifications
  } = useRealtimeNotifications();

  // Track ongoing delete operations to prevent duplicates
  const [deletingNotifications, setDeletingNotifications] = useState<Set<string>>(new Set());

  // Delete notification function with duplicate prevention
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    // Prevent duplicate delete calls
    if (deletingNotifications.has(notificationId)) {
      console.log('🔄 Delete already in progress for notification:', notificationId);
      return false;
    }

    // Add to deleting set
    setDeletingNotifications(prev => new Set(prev).add(notificationId));

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Notification deleted successfully:', notificationId);
        // The notification will be removed from state by the realtime hook
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete notification:', notificationId, errorData.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', notificationId, error);
      return false;
    } finally {
      // Remove from deleting set
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
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



  // Load profile data from API
  const loadProfileData = async () => {
    try {
      // Get user settings for avatar
      const settingsResponse = await fetch('/api/user/settings', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setProfileAvatar(settingsData.settings?.profile?.avatar || '/api/placeholder/150/150');
      }

      // Get user auth data for username and email
      const authResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setUserData({
          username: authData.user?.username || 'User',
          email: authData.user?.email || 'user@example.com'
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Register global notification refresh
  useEffect(() => {
    setGlobalNotificationRefresh(refreshNotifications);
  }, [refreshNotifications]);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
    
    // Set up interval to check for profile updates
    const profileInterval = setInterval(() => {
      loadProfileData();
    }, 30000);
    
    // Listen for storage events (when settings are updated)
    const handleStorageChange = () => {
      loadProfileData();
    };
    
    const handleProfileUpdate = () => {
      loadProfileData();
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
        {/* Notifications with Popover */}
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoadingNotifications}
          connectionStatus={connectionStatus}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        >
          <motion.button
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
        </NotificationPopover>

        {/* Profile Avatar */}
        <ProfilePopover 
          userName={userData?.username || "User"} 
          userEmail={userData?.email || "user@example.com"}
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


    </motion.div>
  );
}