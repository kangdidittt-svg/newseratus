'use client';

// Global notification refresh trigger
let globalRefreshNotifications: (() => Promise<void>) | null = null;

export const setGlobalNotificationRefresh = (refreshFn: () => Promise<void>) => {
  globalRefreshNotifications = refreshFn;
};

export const triggerNotificationRefresh = async () => {
  if (globalRefreshNotifications) {
    console.log('🔄 Triggering global notification refresh...');
    await globalRefreshNotifications();
  } else {
    console.warn('⚠️ Global notification refresh not available');
  }
};