'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import ModernCard from '@/components/ModernCard';

interface PricingData {
  hasEnoughData: boolean;
  minPrice?: number;
  maxPrice?: number;
  avgPrice?: number;
  medianPrice?: number;
  recommendedPrice?: number;
  projectCount?: number;
  message?: string;
}

interface SmartPricingSuggestionProps {
  category: string;
  workTypeId?: string;
  complexityId?: string;
  onUseRecommendation: (price: number) => void;
}

export default function SmartPricingSuggestion({ 
  category, 
  workTypeId, 
  complexityId, 
  onUseRecommendation 
}: SmartPricingSuggestionProps) {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPricingData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('category', category);
      if (workTypeId) params.append('workTypeId', workTypeId);
      if (complexityId) params.append('complexityId', complexityId);

      const response = await fetch(`/api/smart-pricing?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPricingData(data);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    } finally {
      setLoading(false);
    }
  }, [category, workTypeId, complexityId]);

  useEffect(() => {
    if (category) {
      fetchPricingData();
    }
  }, [category, workTypeId, complexityId, fetchPricingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <ModernCard>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
          </div>
        </div>
      </ModernCard>
    );
  }

  if (!pricingData) {
    return null;
  }

  if (!pricingData.hasEnoughData) {
    return (
      <ModernCard>
        <div className="text-center">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{pricingData.message}</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Smart Pricing Suggestion</h3>
            <p className="text-sm text-gray-600">Berdasarkan {pricingData.projectCount} project sejenis</p>
          </div>
        </div>

        {/* Pricing Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="app-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Terendah</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {formatCurrency(pricingData.minPrice!)}
            </div>
          </div>
          <div className="app-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-600">Tertinggi</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {formatCurrency(pricingData.maxPrice!)}
            </div>
          </div>
        </div>

        <div className="app-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Rata-rata</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(pricingData.avgPrice!)}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-blue-100 rounded">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-800">Rekomendasi Harga</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-3">
            {formatCurrency(pricingData.recommendedPrice!)}
          </div>
          <button
            onClick={() => onUseRecommendation(pricingData.recommendedPrice!)}
            className="app-btn-primary w-full"
          >
            Gunakan rekomendasi ini
          </button>
        </div>
      </div>
    </ModernCard>
  );
}