import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client, { normalizeClientName } from '@/models/Client';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

// GET /api/clients/check-duplicate?name=...
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(request.user?.userId);

    const { searchParams } = new URL(request.url);
    const rawName = (searchParams.get('name') || '').trim();

    if (!rawName) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const normalized = normalizeClientName(rawName);
    const existingClient = await Client.findOne({
      userId: userObjectId,
      nameNormalized: normalized
    }).lean();

    if (existingClient) {
      const [projectCount, invoiceCount] = await Promise.all([
        Project.countDocuments({ userId: userObjectId, clientId: existingClient._id }),
        Invoice.countDocuments({ userId: userObjectId, clientId: existingClient._id })
      ]);

      return NextResponse.json({
        exists: true,
        client: {
          ...existingClient,
          projectCount,
          invoiceCount
        }
      }, { status: 200 });
    }

    return NextResponse.json({ exists: false }, { status: 200 });
  } catch (error) {
    console.error('Check duplicate client error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
