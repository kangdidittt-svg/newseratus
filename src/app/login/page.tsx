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
      setError(result.error || 'Login failed. Please check your username and password.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white font-sans">
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0C0E] flex items-center justify-center text-[#F5F5F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
