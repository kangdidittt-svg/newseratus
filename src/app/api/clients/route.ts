import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client, { normalizeClientName } from '@/models/Client';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

// GET /api/clients - Get all clients with project & invoice counts for the authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';

    const filter: Record<string, any> = { userId: userObjectId };
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex }
      ];
    }

    const clients = await Client.find(filter)
      .sort({ name: 1 })
      .lean();

    // Aggregate counts for projects and invoices
    const clientIds = clients.map(c => c._id);

    const [projectCounts, invoiceCounts] = await Promise.all([
      Project.aggregate([
        { $match: { userId: userObjectId, clientId: { $in: clientIds } } },
        { $group: { _id: '$clientId', count: { $sum: 1 } } }
      ]),
      Invoice.aggregate([
        { $match: { userId: userObjectId, clientId: { $in: clientIds } } },
        { $group: { _id: '$clientId', count: { $sum: 1 } } }
      ])
    ]);

    const projectCountMap = new Map(projectCounts.map(item => [item._id.toString(), item.count]));
    const invoiceCountMap = new Map(invoiceCounts.map(item => [item._id.toString(), item.count]));

    const enrichedClients = clients.map(client => {
      const idStr = client._id.toString();
      return {
        ...client,
        projectCount: projectCountMap.get(idStr) || 0,
        invoiceCount: invoiceCountMap.get(idStr) || 0
      };
    });

    return NextResponse.json({ clients: enrichedClients }, { status: 200 });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/clients - Create a new client with normalized duplicate protection
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);

    const body = await request.json();
    const rawName = (body.name || '').trim();

    if (!rawName) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    const normalized = normalizeClientName(rawName);
    if (!normalized) {
      return NextResponse.json({ error: 'Valid client name is required' }, { status: 400 });
    }

    // Check for duplicate client (case-insensitive, normalized)
    const existingClient = await Client.findOne({
      userId: userObjectId,
      nameNormalized: normalized
    });

    if (existingClient) {
      return NextResponse.json(
        {
          error: `A client named "${existingClient.name}" already exists`,
          duplicate: true,
          client: {
            ...existingClient.toObject(),
            projectCount: await Project.countDocuments({ userId: userObjectId, clientId: existingClient._id }),
            invoiceCount: await Invoice.countDocuments({ userId: userObjectId, clientId: existingClient._id })
          }
        },
        { status: 409 }
      );
    }

    // Create client
    const newClient = new Client({
      name: rawName,
      nameNormalized: normalized,
      email: body.email?.trim() || undefined,
      phone: body.phone?.trim() || undefined,
      company: body.company?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      userId: userObjectId
    });

    await newClient.save();

    return NextResponse.json(
      {
        message: 'Client created successfully',
        client: {
          ...newClient.toObject(),
          projectCount: 0,
          invoiceCount: 0
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A client with this name already exists', duplicate: true },
        { status: 409 }
      );
    }
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
