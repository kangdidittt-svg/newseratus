'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TopBarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  projectTitle?: string;
  clientName?: string;
  amount?: number;
  unread: boolean;
  time: string;
}

export default function TopBar({}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string>('/api/placeholder/150/150');

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      });
      
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

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

  // Load notifications and profile avatar on component mount
  useEffect(() => {
    fetchNotifications();
    loadProfileAvatar();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
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
       clearInterval(interval);
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
          >
            <Bell className="h-5 w-5" style={{ color: 'var(--neuro-text-primary)' }} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
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
                    <motion.div
                      key={notification.id}
                      className="px-4 py-3 cursor-pointer border-l-4 transition-colors"
                      style={{
                        borderLeftColor: notification.unread ? 'var(--neuro-orange)' : 'transparent',
                        backgroundColor: notification.unread ? 'var(--neuro-orange-light)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--neuro-bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notification.unread ? 'var(--neuro-orange-light)' : 'transparent';
                      }}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => {
                        if (notification.unread) {
                          markAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: 'var(--neuro-text-primary)' }}>{notification.title}</p>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--neuro-text-secondary)' }}>{notification.message}</p>
                          <p className="text-xs mt-2" style={{ color: 'var(--neuro-text-muted)' }}>{notification.time}</p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 rounded-full mt-1 ml-2 flex-shrink-0" style={{ backgroundColor: 'var(--neuro-orange)' }}></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="px-4 py-2" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                <button 
                  onClick={() => fetchNotifications()}
                  className="text-sm font-medium"
                  style={{ color: 'var(--neuro-orange)' }}
                >
                  Refresh notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Profile Avatar */}
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