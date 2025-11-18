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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/invoice/create')}
              className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
              title="Kembali ke Buat Invoice"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Riwayat Invoice
              </h1>
              <p className="mt-2 text-gray-600">Kelola dan export invoice yang telah dibuat</p>
            </div>
          </div>
        </div>

        {/* Invoice History Table */}
        <InvoiceHistoryTable refreshTrigger={refreshTrigger} />

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/invoice/create')}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:from-primary/80 hover:to-accent/80 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Invoice Baru</span>
          </button>
          <button
            onClick={handleRefresh}
            className="bg-white/70 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-lg hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}