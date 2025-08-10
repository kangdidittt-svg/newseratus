'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalEarnings: number;
  totalHours: number;
  averageHourlyRate: number;
  totalPendingPayments: number;
}

interface Project {
  _id: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  budget: number;
  deadline?: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats | null;
  recentProjects: Project[];
  loading: boolean;
  error: string | null;
}

export function useRealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    recentProjects: [],
    loading: true,
    error: null
  });
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          stats: data.stats,
          recentProjects: data.recentProjects || [],
          loading: false,
          error: null
        });
      } else {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Network error occurred'
      }));
    }
  }, []);

  // Setup SSE connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let isActive = true;

    // Polling fallback function
    const startPollingFallback = () => {
      if (!isActive) return;
      
      console.log('📊 Starting polling fallback for dashboard...');
      setConnectionStatus('disconnected');
      
      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval);
          return;
        }
        
        try {
          await fetchDashboardData();
        } catch (error) {
          console.error('Polling fallback error:', error);
        }
      }, 120000); // Poll every 2 minutes as fallback (reduced frequency)
      
      // Store interval for cleanup
      reconnectTimeout = pollInterval as NodeJS.Timeout;
    };

    const connectSSE = async () => {
      if (!isActive) return;
      
      setConnectionStatus('connecting');
      console.log('🔌 Connecting to dashboard SSE...');
      
      // Since auth-token is httpOnly cookie, we rely on withCredentials to send it automatically
      console.log('🔌 Attempting SSE connection with credentials');
      
      eventSource = new EventSource('/api/dashboard/stream', {
        withCredentials: true
      });

      eventSource.onopen = () => {
        console.log('✅ Dashboard SSE connected');
        setConnectionStatus('connected');
        setDashboardData(prev => ({ ...prev, error: null }));
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'dashboard_update') {
            console.log('📊 Dashboard data updated via SSE:', data.reason || 'manual');
            setDashboardData({
              stats: data.data.stats,
              recentProjects: data.data.recentProjects,
              loading: false,
              error: null
            });
          } else if (data.type === 'connected') {
            console.log('🔌 Dashboard SSE connection confirmed');
            // Fetch initial data if not already loaded
            if (!dashboardData.stats) {
              fetchDashboardData();
            }
          } else if (data.type === 'error') {
            console.error('❌ Dashboard SSE server error:', data.message);
            setDashboardData(prev => ({
              ...prev,
              error: data.message || 'Server error occurred'
            }));
          } else if (data.type === 'heartbeat') {
            // Keep connection alive
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ Dashboard SSE error:', error);
        setConnectionStatus('disconnected');
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        
        // Fallback to polling if SSE fails
        if (isActive) {
          console.log('🔄 SSE failed, falling back to polling...');
          startPollingFallback();
        }
      };
    };

    // Initial connection
    connectSSE();

    // Cleanup
    return () => {
      isActive = false;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Keep custom events as fallback for immediate updates
  useEffect(() => {
    const handleProjectUpdate = () => {
      console.log('🔄 Dashboard: Received project update event (fallback)');
      // SSE will handle the actual update, this is just for immediate feedback
    };

    const handleProjectCreated = () => {
      console.log('🆕 Dashboard: Received project created event (fallback)');
      // SSE will handle the actual update, this is just for immediate feedback
    };

    const handleProjectCompleted = () => {
      console.log('✅ Dashboard: Received project completed event (fallback)');
      // SSE will handle the actual update, this is just for immediate feedback
    };

    // Add event listeners
    window.addEventListener('project-updated', handleProjectUpdate);
    window.addEventListener('project-created', handleProjectCreated);
    window.addEventListener('project-completed', handleProjectCompleted);

    // Cleanup
    return () => {
      window.removeEventListener('project-updated', handleProjectUpdate);
      window.removeEventListener('project-created', handleProjectCreated);
      window.removeEventListener('project-completed', handleProjectCompleted);
    };
  }, []);

  // Fallback polling only if SSE is disconnected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (connectionStatus === 'disconnected') {
      console.log('📡 Dashboard SSE disconnected, using fallback polling');
      interval = setInterval(() => {
        console.log('🔄 Dashboard: Fallback polling triggered');
        fetchDashboardData();
      }, 120000); // 2 minute fallback polling (reduced frequency)
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectionStatus]);

  return {
    ...dashboardData,
    connectionStatus,
    refreshDashboard: fetchDashboardData
  };
}

// Helper function to trigger dashboard refresh from anywhere
export const triggerDashboardRefresh = (eventType: 'project-created' | 'project-updated' | 'project-completed') => {
  console.log(`🚀 Triggering dashboard refresh: ${eventType}`);
  window.dispatchEvent(new CustomEvent(eventType));
};