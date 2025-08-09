'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm"
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle - Removed as sidebar is always visible */}

        {/* Date Display */}
        <div className="hidden md:block">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </motion.div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5 text-gray-600" />
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
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead()}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        notification.unread ? 'border-cyan-500 bg-cyan-50/30' : 'border-transparent'
                      }`}
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
                          <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{notification.message}</p>
                          <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1 ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button 
                  onClick={() => fetchNotifications()}
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                >
                  Refresh notifications
                </button>
              </div>
            </motion.div>
          )}
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