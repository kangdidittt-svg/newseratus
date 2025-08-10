'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Settings from '@/components/Settings';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--neuro-orange)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--neuro-bg)' }}>
      <div className="container mx-auto px-4 py-8">
        <Settings />
      </div>
    </div>
  );
}