'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ModernCard from '@/components/ModernCard';

interface StudioSummary {
  activeProjectsCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesTotalIdr: number;
  completedProjectsThisMonth: number;
  topWorkTypeNameThisMonth: string | null;
  totalPaidThisMonth: number;
  totalPaidLastMonth: number;
}

export default function SmartSummaryPanel() {
  const [summary, setSummary] = useState<StudioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/studio-summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching studio summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTrend = () => {
    if (!summary) return { word: 'stabil', percent: 0, icon: Minus };
    
    const trendPercent = summary.totalPaidLastMonth > 0
      ? ((summary.totalPaidThisMonth - summary.totalPaidLastMonth) / summary.totalPaidLastMonth) * 100
      : 0;

    let word = 'stabil';
    let icon = Minus;

    if (trendPercent > 5) {
      word = 'naik';
      icon = TrendingUp;
    } else if (trendPercent < -5) {
      word = 'turun';
      icon = TrendingDown;
    }

    return { word, percent: Math.abs(Math.round(trendPercent)), icon };
  };

  if (loading) {
    return (
      <ModernCard>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </ModernCard>
    );
  }

  if (!summary) {
    return (
      <ModernCard>
        <div className="text-center text-gray-500">
          Maaf yang mulia, aku gagal ambil data hari ini 😅
        </div>
      </ModernCard>
    );
  }

  const trend = calculateTrend();
  const TrendIcon = trend.icon;

  return (
    <ModernCard>
      <div className="space-y-4">
        {/* Header with refresh button */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">Ringkasan Bulan Ini</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="app-btn-secondary p-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.activeProjectsCount}</div>
            <div className="text-sm text-gray-600">Project Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.completedProjectsThisMonth}</div>
            <div className="text-sm text-gray-600">Selesai Bulan Ini</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.pendingInvoicesCount}</div>
            <div className="text-sm text-gray-600">Invoice Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaidThisMonth)}</div>
            <div className="text-sm text-gray-600">Pemasukan Bulan Ini</div>
          </div>
        </div>

        {/* Summary paragraph */}
        <div className="app-muted text-sm leading-relaxed">
          <p>
            Bulan ini kamu menyelesaikan {summary.completedProjectsThisMonth} project, 
            mengirim {summary.pendingInvoicesCount} invoice dengan total pemasukan {formatCurrency(summary.totalPaidThisMonth)}, 
            dan masih ada {formatCurrency(summary.pendingInvoicesTotalIdr)} yang pending. 
            Dibanding bulan lalu, pemasukan kamu {trend.word}{' '}
            <span className={`inline-flex items-center gap-1 ${
              trend.word === 'naik' ? 'text-green-600' : 
              trend.word === 'turun' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendIcon className="h-3 w-3" />
              {trend.percent}%
            </span>.
          </p>
          {summary.topWorkTypeNameThisMonth && (
            <p className="mt-2">
              Tipe kerja terbanyak bulan ini: <span className="font-medium">{summary.topWorkTypeNameThisMonth}</span>
            </p>
          )}
        </div>
      </div>
    </ModernCard>
  );
}