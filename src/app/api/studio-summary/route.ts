import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate date ranges
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 1);

    // Active projects count (support legacy 'active')
    const activeProjectsCount = await Project.countDocuments({
      userId,
      status: { $in: ['ongoing', 'active'] }
    });

    // Pending invoices count and total
    const pendingInvoices = await Invoice.find({
      userId,
      status: 'pending'
    }).select('totalIdr');

    const pendingInvoicesCount = pendingInvoices.length;
    const pendingInvoicesTotalIdr = pendingInvoices.reduce((sum, invoice) => sum + (invoice.totalIdr || 0), 0);

    // Completed projects this month
    const completedProjectsThisMonth = await Project.countDocuments({
      userId,
      status: { $in: ['completed'] },
      completedAt: {
        $gte: startOfCurrentMonth,
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });

    // Top work type this month
    const topWorkTypeAggregation = await Project.aggregate([
      {
        $match: {
          userId: userId,
          status: { $in: ['completed'] },
          completedAt: {
            $gte: startOfCurrentMonth,
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: '$workTypeId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: 'worktypes',
          localField: '_id',
          foreignField: '_id',
          as: 'workType'
        }
      },
      {
        $unwind: '$workType'
      },
      {
        $project: {
          name: '$workType.name'
        }
      }
    ]);

    const topWorkTypeNameThisMonth = topWorkTypeAggregation.length > 0 ? topWorkTypeAggregation[0].name : null;

    // Paid amounts for trend calculation
    const paidThisMonth = await Invoice.aggregate([
      {
        $match: {
          userId: userId,
          status: 'paid',
          updatedAt: {
            $gte: startOfCurrentMonth,
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalIdr' }
        }
      }
    ]);

    const paidLastMonth = await Invoice.aggregate([
      {
        $match: {
          userId: userId,
          status: 'paid',
          updatedAt: {
            $gte: startOfLastMonth,
            $lt: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalIdr' }
        }
      }
    ]);

    const totalPaidThisMonth = paidThisMonth.length > 0 ? paidThisMonth[0].total : 0;
    const totalPaidLastMonth = paidLastMonth.length > 0 ? paidLastMonth[0].total : 0;

    return NextResponse.json({
      activeProjectsCount,
      pendingInvoicesCount,
      pendingInvoicesTotalIdr,
      completedProjectsThisMonth,
      topWorkTypeNameThisMonth,
      totalPaidThisMonth,
      totalPaidLastMonth
    });
  } catch (error) {
    console.error('Error fetching studio summary:', error);
    return NextResponse.json({ error: 'Failed to fetch studio summary' }, { status: 500 });
  }
});