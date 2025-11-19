'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, User, Briefcase, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect, ReactNode } from 'react';

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

interface NotificationPopoverProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  connectionStatus: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  onMarkAsRead: (ids?: string[]) => void;
  onDelete: (id: string) => Promise<boolean>;
  children: ReactNode;
}

export default function NotificationPopover({
  notifications,
  unreadCount,
  isLoading,
  connectionStatus,
  onMarkAsRead,
  onDelete,
  children
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-open on hover with delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Immediate open on hover
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Delay close to allow moving to popover
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  // Get notification type icon
  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'project':
        return <Briefcase className="h-4 w-4" style={{ color: 'var(--neuro-blue)' }} />;
      case 'user':
        return <User className="h-4 w-4" style={{ color: 'var(--neuro-green)' }} />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />;
      default:
        return <Bell className="h-4 w-4" style={{ color: 'var(--neuro-text-secondary)' }} />;
    }
  };

  // Format time
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return timeString || 'Baru saja';
    }
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h yang lalu`;
    return `${Math.floor(diffInMinutes / 1440)}d yang lalu`;
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.3
            }}
            className="absolute right-0 mt-3 w-96 z-50"
            style={{
              background: 'var(--neuro-bg)',
              borderRadius: '20px',
              boxShadow: '12px 12px 24px rgba(163, 163, 166, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--neuro-border)'
            }}

          >
            {/* Header */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--neuro-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" style={{ color: 'var(--neuro-orange)' }} />
                  <h3 className="font-semibold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                    Notifikasi
                  </h3>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--neuro-orange)' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: connectionStatus === 'connected' 
                        ? 'var(--neuro-green)' 
                        : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
                        ? 'var(--neuro-orange)'
                        : 'var(--neuro-red)'
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--neuro-text-secondary)' }}>
                    {connectionStatus === 'connected' ? 'Terhubung' : 
                     connectionStatus === 'connecting' ? 'Menghubungkan...' :
                     connectionStatus === 'reconnecting' ? 'Menghubungkan ulang...' : 'Terputus'}
                  </span>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={() => onMarkAsRead()}
                  className="mt-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--neuro-orange)' }}
                >
                  Tandai semua sudah dibaca
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-6 py-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-3"
                    style={{ borderColor: 'var(--neuro-orange)' }}
                  />
                  <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>
                    Memuat notifikasi...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--neuro-text-muted)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--neuro-text-primary)' }}>
                    Tidak ada notifikasi
                  </p>
                  <p className="text-xs" style={{ color: 'var(--neuro-text-secondary)' }}>
                    Notifikasi baru akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <AnimatePresence mode="popLayout">
                    {notifications
                      .filter(notification => !hiddenIds.has(notification.id))
                      .slice(0, 5)
                      .map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          height: 0, 
                          scale: 0.8,
                          x: 100,
                          transition: { 
                            duration: 0.3,
                            ease: "easeInOut"
                          }
                        }}
                        transition={{ 
                            layout: { duration: 0.2, ease: "easeInOut" },
                            delay: index * 0.1
                          }}
                          animate={{ opacity: 1, x: 0 }}
                      className="px-4 py-3 border-l-4 transition-all duration-200 cursor-pointer group"
                      style={{
                        borderLeftColor: notification.unread ? 'var(--neuro-orange)' : 'transparent',
                        backgroundColor: notification.unread ? 'rgba(255, 165, 0, 0.05)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = notification.unread 
                          ? 'rgba(255, 165, 0, 0.1)' 
                          : 'var(--neuro-bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notification.unread 
                          ? 'rgba(255, 165, 0, 0.05)' 
                          : 'transparent';
                      }}
                      onClick={() => {
                        if (notification.unread) {
                          onMarkAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--neuro-text-primary)' }}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-xs flex-shrink-0" style={{ color: 'var(--neuro-text-secondary)' }}>
                                {formatTime(notification.time)}
                              </span>
                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--neuro-orange)' }} />
                              )}
                            </div>
                          </div>
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--neuro-text-secondary)' }}>
                            {notification.message}
                          </p>
                          {notification.clientName && (
                            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--neuro-blue)' }}>
                              Client: {notification.clientName}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (deletingIds.has(notification.id) || hiddenIds.has(notification.id)) return;
                              
                              // Optimistic update - hide immediately with animation
                              setHiddenIds(prev => new Set(prev).add(notification.id));
                              setDeletingIds(prev => new Set(prev).add(notification.id));
                              
                              try {
                                const success = await onDelete(notification.id);
                                if (success) {
                                  console.log('✅ Notification deleted successfully:', notification.id);
                                } else {
                                  console.error('❌ Failed to delete notification:', notification.id);
                                  // Revert optimistic update on failure
                                  setHiddenIds(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(notification.id);
                                    return newSet;
                                  });
                                }
                              } catch (error) {
                                console.error('❌ Error deleting notification:', error);
                                // Revert optimistic update on error
                                setHiddenIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(notification.id);
                                  return newSet;
                                });
                              } finally {
                                setDeletingIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(notification.id);
                                  return newSet;
                                });
                              }
                            }}
                            disabled={deletingIds.has(notification.id) || hiddenIds.has(notification.id)}
                            className="p-1 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (!deletingIds.has(notification.id)) {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title={deletingIds.has(notification.id) ? "Menghapus..." : "Hapus notifikasi"}
                          >
                            {deletingIds.has(notification.id) ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border border-t-transparent rounded-full"
                                style={{ borderColor: 'var(--neuro-red)' }}
                              />
                            ) : (
                              <Trash2 className="h-3 w-3" style={{ color: 'var(--neuro-red)' }} />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                  
                  {notifications.filter(notification => !hiddenIds.has(notification.id)).length > 5 && (
                    <div className="px-4 py-2 text-center border-t" style={{ borderColor: 'var(--neuro-border)' }}>
                      <p className="text-xs" style={{ color: 'var(--neuro-text-secondary)' }}>
                        +{notifications.filter(notification => !hiddenIds.has(notification.id)).length - 5} notifikasi lainnya
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--neuro-border)' }}>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      onMarkAsRead();
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                    style={{
                      color: 'var(--neuro-text-secondary)',
                      backgroundColor: 'var(--neuro-bg-secondary)'
                    }}
                  >
                    <Check className="h-4 w-4" />
                    <span>Tandai Dibaca</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}