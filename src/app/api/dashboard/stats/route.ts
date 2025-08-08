import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const userId = request.user?.userId;

    // Get project statistics
    const totalProjects = await Project.countDocuments({ userId });
    const activeProjects = await Project.countDocuments({ userId, status: 'active' });
    const completedProjects = await Project.countDocuments({ userId, status: 'completed' });
    const onHoldProjects = await Project.countDocuments({ userId, status: 'on-hold' });

    // Get total earnings
    const earningsResult = await Project.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalEarned' },
          totalHours: { $sum: '$hoursWorked' }
        }
      }
    ]);

    const totalEarnings = earningsResult[0]?.totalEarnings || 0;
    const totalHours = earningsResult[0]?.totalHours || 0;

    // Get recent projects
    const recentProjects = await Project.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title client status priority updatedAt')
      .lean();

    // Get projects by status for chart
    const projectsByStatus = [
      { name: 'Active', value: activeProjects },
      { name: 'Completed', value: completedProjects },
      { name: 'On Hold', value: onHoldProjects },
      { name: 'Cancelled', value: await Project.countDocuments({ userId, status: 'cancelled' }) }
    ];

    // Get monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await Project.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$totalEarned' },
          hours: { $sum: '$hoursWorked' }
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
          averageHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0
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