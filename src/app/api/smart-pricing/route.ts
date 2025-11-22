import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import Project from '@/models/Project';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const workTypeId = searchParams.get('workTypeId');
    const complexityId = searchParams.get('complexityId');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Build query
    interface QueryInterface {
      userId: string;
      category: string;
      status: string;
      workTypeId?: string;
      complexityId?: string;
    }
    
    const query: QueryInterface = {
      userId,
      category,
      status: 'completed'
    };

    if (workTypeId) {
      query.workTypeId = workTypeId;
    }

    if (complexityId) {
      query.complexityId = complexityId;
    }

    // Get historical projects
    const projects = await Project.find(query).select('budget');

    if (projects.length < 2) {
      return NextResponse.json({
        message: 'Data historis belum cukup untuk rekomendasi harga.',
        hasEnoughData: false
      });
    }

    // Calculate pricing statistics
    const prices = projects.map(p => p.budget || 0).filter(price => price > 0);
    
    if (prices.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada data harga yang tersedia.',
        hasEnoughData: false
      });
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate median
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)];

    const recommendedPrice = medianPrice || avgPrice;

    return NextResponse.json({
      hasEnoughData: true,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
      medianPrice: Math.round(medianPrice),
      recommendedPrice: Math.round(recommendedPrice),
      projectCount: projects.length
    });
  } catch (error) {
    console.error('Error calculating smart pricing:', error);
    return NextResponse.json({ error: 'Failed to calculate pricing recommendations' }, { status: 500 });
  }
});