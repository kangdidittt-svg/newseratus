'use client';

import { useState } from 'react';
import { MobileLayout, DesktopLayout } from './layout/ResponsiveLayout';
import { MobileDashboard } from './MobileDashboard';
import { DesktopDashboard } from './DesktopDashboard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Mobile Layout */}
      <MobileLayout>
        <MobileDashboard />
      </MobileLayout>

      {/* Desktop Layout */}
      <DesktopLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <DesktopDashboard onNavigate={handleTabChange} />
      </DesktopLayout>
    </>
  );
}