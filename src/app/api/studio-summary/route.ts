import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();

    const userId = request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate date ranges
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // Active projects count
    const activeProjectsCount = await Project.countDocuments({
      userId: userObjectId,
      status: { $in: ['ongoing', 'active'] }
    });

    // Pending invoices count and total
    const pendingInvoices = await Invoice.find({
      userId: userObjectId,
      status: 'pending'
    }).select('total');

    const pendingInvoicesCount = pendingInvoices.length;
    const pendingInvoicesTotalIdr = pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Completed projects this month
    const completedProjectsThisMonth = await Project.countDocuments({
      userId: userObjectId,
      status: 'completed',
      $or: [
        { completedAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth } },
        { updatedAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth } }
      ]
    });

    // Top category / work type this month
    const topCategoryAggregation = await Project.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topWorkTypeNameThisMonth = topCategoryAggregation.length > 0 && topCategoryAggregation[0]._id 
      ? topCategoryAggregation[0]._id 
      : 'General Freelance';

    return NextResponse.json({
      activeProjectsCount,
      pendingInvoicesCount,
      pendingInvoicesTotalIdr,
      completedProjectsThisMonth,
      topWorkTypeNameThisMonth
    });
  } catch (error) {
    console.error('Error fetching studio summary:', error);
    return NextResponse.json({ error: 'Failed to fetch studio summary' }, { status: 500 });
  }
});