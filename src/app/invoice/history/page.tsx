'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import InvoiceHistoryTable from '@/components/InvoiceHistoryTable';

export default function InvoiceHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Tunggu sampai proses checkAuth selesai agar tidak redirect palsu
    if (!loading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading || !user) {
    // Tampilkan loading saat menunggu checkAuth selesai
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-3 md:mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="neuro-button px-3 py-2 rounded-full"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--neuro-text-primary)' }}>
                Riwayat Invoice
              </h1>
              <p className="mt-1 md:mt-2 text-sm md:text-base" style={{ color: 'var(--neuro-text-secondary)' }}>Kelola dan preview invoice yang telah dibuat</p>
            </div>
          </div>
        </div>

        {/* Invoice History Table */}
        <InvoiceHistoryTable refreshTrigger={refreshTrigger} />

        {/* Navigation */}
        <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-3 md:gap-4">
          <button
            onClick={() => router.push('/invoice/create')}
            className="px-6 py-3 rounded-full flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--neuro-orange)', color: '#fff' }}
          >
            <Plus className="h-4 w-4" />
            <span>Buat Invoice Baru</span>
          </button>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 rounded-full flex items-center justify-center gap-2"
            style={{ backgroundColor: '#fff', border: '1px solid var(--neuro-border)', color: 'var(--neuro-text-primary)' }}
          >
            <FileText className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
