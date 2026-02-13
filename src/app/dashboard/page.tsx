'use client';

import ClientApp from '../../components/ClientApp';
import { MobileDashboard } from '@/components/MobileDashboard';

export default function DashboardPage() {
  return (
    <>
      <div className="md:hidden">
        <MobileDashboard />
      </div>
      <div className="hidden md:block">
        <ClientApp />
      </div>
    </>
  );
}
