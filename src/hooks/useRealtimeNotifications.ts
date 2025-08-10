'use client';

import { useState, useEffect, useCallback } from 'react';

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



export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [isLoading, setIsLoading] = useState(true);


  // Fetch initial notifications
  const fetchInitialNotifications = useCallback(async () => {
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
      console.error('Error fetching initial notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual refresh function for immediate updates
  const refreshNotifications = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setConnectionStatus('connected');
        console.log('🔄 Notifications refreshed manually');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setConnectionStatus('disconnected');
    }
  }, []);



  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      });
      
      // Update local state
      if (notificationIds && notificationIds.length > 0) {
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, unread: false }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      } else {
        // Mark all as read
        setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Initialize notification polling (fallback approach)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let isActive = true;

    const pollNotifications = async () => {
      if (!isActive) return;
      
      try {
        setConnectionStatus('connecting');
        const response = await fetch('/api/notifications');
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setConnectionStatus('disconnected');
      }
    };

    // Initialize
    fetchInitialNotifications();
    requestNotificationPermission();
    
    // Start polling every 30 seconds as fallback (reduced frequency)
    pollInterval = setInterval(pollNotifications, 30000);
    
    // Initial poll
    setTimeout(pollNotifications, 1000);

    // Cleanup
    return () => {
      isActive = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [fetchInitialNotifications, requestNotificationPermission]);

  // Reconnect when tab becomes visible again
   useEffect(() => {
     const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible' && connectionStatus !== 'connected') {
         console.log('🔄 Tab became visible, will reconnect automatically...');
         // Connection will be handled by the main useEffect
       }
     };

     document.addEventListener('visibilitychange', handleVisibilityChange);
     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, [connectionStatus]);

   return {
     notifications,
     unreadCount,
     connectionStatus,
     markAsRead,
     refreshNotifications,
     isLoading
   };
}