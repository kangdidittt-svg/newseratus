'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import InvoiceCreateForm from '@/components/InvoiceCreateForm';

export default function CreateInvoicePage() {
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

  const handleInvoiceCreated = () => {
    // Refresh the form and optionally redirect to history
    setRefreshTrigger(prev => prev + 1);
    // Optionally redirect to history page after successful creation
    setTimeout(() => {
      router.push('/invoice/history');
    }, 2000);
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
              className="p-2 text-gray-600 hover:text-primary hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Buat Invoice
              </h1>
              <p className="mt-1 md:mt-2 text-gray-600 text-sm md:text-base">Buat invoice profesional dari project yang ada</p>
            </div>
          </div>
        </div>

        {/* Invoice Create Form */}
        <InvoiceCreateForm 
          key={refreshTrigger}
          onInvoiceCreated={handleInvoiceCreated}
        />

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/invoice/history')}
            className="bg-white/70 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-lg hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Lihat Riwayat Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
