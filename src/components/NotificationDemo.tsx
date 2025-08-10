'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell } from 'lucide-react';
import NotificationPopover from './NotificationPopover';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type?: string;
  projectId?: string;
  projectTitle?: string;
  clientName?: string;
}

export default function NotificationDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Project Berhasil Dibuat',
      message: 'Project "Website E-commerce" untuk client PT. Digital Indonesia telah berhasil ditambahkan',
      time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      unread: true,
      type: 'project',
      projectTitle: 'Website E-commerce',
      clientName: 'PT. Digital Indonesia'
    },
    {
      id: '2',
      title: 'Deadline Reminder',
      message: 'Project "Mobile App Development" akan berakhir dalam 2 hari',
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      unread: true,
      type: 'warning',
      projectTitle: 'Mobile App Development',
      clientName: 'Startup Tech'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Pembayaran sebesar $2,500 telah diterima dari client ABC Corp',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      unread: false,
      type: 'general',
      clientName: 'ABC Corp'
    },
    {
      id: '4',
      title: 'New Message',
      message: 'Anda memiliki pesan baru dari client mengenai revisi design',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      unread: true,
      type: 'user',
      clientName: 'Creative Agency'
    },
    {
      id: '5',
      title: 'Task Completed',
      message: 'Task "Database Setup" telah selesai dikerjakan',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      unread: false,
      type: 'project',
      projectTitle: 'Backend API Development'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (ids?: string[]) => {
    setNotifications(prev => 
      prev.map(notification => {
        if (!ids || ids.includes(notification.id)) {
          return { ...notification, unread: false };
        }
        return notification;
      })
    );
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    return true;
  };

  const addNewNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'New Test Notification',
      message: `Test notification created at ${new Date().toLocaleTimeString()}`,
      time: new Date().toISOString(),
      unread: true,
      type: 'general'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>
          Notification Popover Demo
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--neuro-text-secondary)' }}>
          Hover over the notification bell to see the popover in action!
        </p>
        
        <div className="flex justify-center items-center space-x-6">
          {/* Demo Notification Button */}
          <NotificationPopover
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={false}
            connectionStatus="connected"
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          >
            <motion.button
              className="neuro-button p-4 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notifications Demo"
            >
              <div className="relative">
                <Bell className="h-6 w-6" style={{ color: 'var(--neuro-text-primary)' }} />
                {/* Connection status indicator */}
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--neuro-green)' }}
                  title="Connected"
                />
              </div>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--neuro-orange)' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>
          </NotificationPopover>
          
          {/* Add Notification Button */}
          <motion.button
            onClick={addNewNotification}
            className="neuro-button px-4 py-2 flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Test Notification</span>
          </motion.button>
        </div>
        
        <div className="mt-8 p-4 neuro-card rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
            Features:
          </h3>
          <ul className="text-sm space-y-1" style={{ color: 'var(--neuro-text-secondary)' }}>
            <li>✨ Auto-open on hover (500ms delay)</li>
            <li>🎯 Click to open/close</li>
            <li>📱 Responsive design</li>
            <li>🔄 Real-time connection status</li>
            <li>✅ Mark as read functionality</li>
            <li>🗑️ Delete notifications</li>
            <li>🎨 Beautiful animations</li>
            <li>⚡ Smooth transitions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}