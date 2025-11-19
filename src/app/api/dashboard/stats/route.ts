import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const userId = request.user?.userId;

    // Get project statistics
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const totalProjects = await Project.countDocuments({ userId: userObjectId });
    const activeProjects = await Project.countDocuments({ userId: userObjectId, status: 'active' });
    const completedProjects = await Project.countDocuments({ userId: userObjectId, status: 'completed' });
    const onHoldProjects = await Project.countDocuments({ userId: userObjectId, status: 'on-hold' });

    // Get total earnings from completed projects
    const earningsResult = await Project.aggregate([
      { $match: { userId: userObjectId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { 
            $sum: { 
              $cond: {
                if: { $and: [{ $ne: ['$totalEarned', null] }, { $gt: ['$totalEarned', 0] }] },
                then: '$totalEarned',
                else: { $ifNull: ['$budget', 0] }
              }
            }
          },
          totalHours: { $sum: '$hoursWorked' }
        }
      }
    ]);

    const totalEarnings = earningsResult[0]?.totalEarnings || 0;
    const totalHours = earningsResult[0]?.totalHours || 0;

    // Get total pending payments from non-completed projects
    const pendingPaymentsResult = await Project.aggregate([
      { $match: { userId: userObjectId, status: { $ne: 'completed' } } },
      {
        $group: {
          _id: null,
          totalPendingPayments: { $sum: { $ifNull: ['$budget', 0] } }
        }
      }
    ]);

    const totalPendingPayments = pendingPaymentsResult[0]?.totalPendingPayments || 0;

    // Get recent projects
    const recentProjects = await Project.find({ userId: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title client status priority budget deadline createdAt updatedAt')
      .lean();

    // Get projects by status for chart
    const projectsByStatus = [
      { name: 'Active', value: activeProjects },
      { name: 'Completed', value: completedProjects },
      { name: 'On Hold', value: onHoldProjects },
      { name: 'Cancelled', value: await Project.countDocuments({ userId: userObjectId, status: 'cancelled' }) }
    ];

    // Get monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await Project.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: { $ifNull: ['$totalEarned', '$budget'] } },
          hours: { $sum: '$hoursWorked' },
          projectCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return NextResponse.json(
      {
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          onHoldProjects,
          totalEarnings,
          totalHours,
          averageHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0,
          totalPendingPayments
        },
        recentProjects,
        projectsByStatus,
        monthlyEarnings
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});