'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginCard from '@/components/LoginCard';

function LoginContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user) {
      // Jika datang dari halaman yang dilindungi, kembali ke halaman tersebut
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const handleLogin = async (username: string, password: string) => {
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--neuro-bg)' }}>
      <LoginCard 
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
