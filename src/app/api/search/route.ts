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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const searchRegex = new RegExp(query, 'i');

    // Search projects
    const projects = await Project.find({
      userId,
      $or: [
        { title: searchRegex },
        { client: searchRegex },
        { category: searchRegex }
      ]
    })
      .populate('workTypeId', 'name')
      .select('title client category status workTypeId')
      .limit(5);

    // Search invoices
    const invoices = await Invoice.find({
      userId,
      $or: [
        { invoiceNumber: searchRegex },
        { clientName: searchRegex },
        { projectName: searchRegex }
      ]
    })
      .select('invoiceNumber clientName projectName status')
      .limit(5);

    // Transform results
    const projectResults = projects.map(project => ({
      id: project._id.toString(),
      type: 'project' as const,
      title: project.title,
      subtitle: `${project.client} • ${project.category}${project.workTypeId ? ` • ${(project.workTypeId as {name: string}).name}` : ''}`,
      url: `/projects/${project._id}`
    }));

    const invoiceResults = invoices.map(invoice => ({
      id: invoice._id.toString(),
      type: 'invoice' as const,
      title: `${invoice.invoiceNumber} - ${invoice.projectName}`,
      subtitle: `${invoice.clientName} • ${invoice.status}`,
      url: `/invoice/${invoice._id}`
    }));

    const allResults = [...projectResults, ...invoiceResults];

    return NextResponse.json(allResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
});