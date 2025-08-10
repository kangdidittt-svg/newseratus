'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type?: string;
}

interface SwipeableNotificationProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const SwipeableNotification: React.FC<SwipeableNotificationProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const constraintsRef = useRef(null);
  const SWIPE_THRESHOLD = -80;
  const DELETE_THRESHOLD = -120;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    if (offset.x < DELETE_THRESHOLD) {
      // Delete if swiped far enough
      setIsDeleting(true);
      setTimeout(() => {
        onDelete();
      }, 200);
    } else if (offset.x < SWIPE_THRESHOLD) {
      // Show delete button
      setDragX(SWIPE_THRESHOLD);
    } else {
      // Snap back
      setDragX(0);
    }
  };



  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      {/* Delete Background */}
      <div 
        className="absolute inset-0 flex items-center justify-end pr-4"
        style={{ backgroundColor: 'transparent' }}
      >
      </div>

      {/* Main Notification Content */}
      <motion.div
        className="relative bg-white px-4 py-3 cursor-pointer border-l-4 transition-colors"
        style={{
          borderLeftColor: notification.unread ? 'var(--neuro-orange)' : 'transparent',
          backgroundColor: 'white'
        }}
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDrag={(event, info) => {
          setDragX(info.offset.x);
        }}
        onDragEnd={handleDragEnd}
        animate={{
          x: isDeleting ? -400 : dragX,
          opacity: isDeleting ? 0 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        onMouseEnter={(e) => {
          if (!isDeleting) {
            e.currentTarget.style.backgroundColor = 'var(--neuro-bg-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDeleting) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        onClick={() => {
          if (!isDeleting && dragX === 0 && notification.unread) {
            onMarkAsRead();
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: 'var(--neuro-text-primary)' }}>
              {notification.title}
            </p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--neuro-text-secondary)' }}>
              {notification.message}
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--neuro-text-muted)' }}>
              {notification.time}
            </p>
          </div>
          {notification.unread && (
            <div 
              className="w-2 h-2 rounded-full mt-1 ml-2 flex-shrink-0" 
              style={{ backgroundColor: 'var(--neuro-orange)' }}
            ></div>
          )}
        </div>
      </motion.div>


    </div>
  );
};

export default SwipeableNotification;