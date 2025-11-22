import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Invoice from '@/models/Invoice'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import mongoose from 'mongoose'

// GET /api/invoices/[id] - Get a specific invoice
export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB()
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
    }

    const invoice = await Invoice.findOne({ _id: id, userId: request.user?.userId })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice }, { status: 200 })
  } catch (error) {
    console.error('Get invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/invoices/[id] - Update basic fields (status, billedToName)
export const PUT = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB()
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
    }

    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (typeof body.status === 'string') {
      updateData.status = body.status
    }
    if (typeof body.billedToName === 'string') {
      updateData.billedToName = body.billedToName.trim()
    }

    const updated = await Invoice.findOneAndUpdate(
      { _id: id, userId: request.user?.userId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Invoice updated', invoice: updated }, { status: 200 })
  } catch (error) {
    console.error('Update invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/invoices/[id] - Delete an invoice
export const DELETE = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB()
    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
    }

    const deleted = await Invoice.findOneAndDelete({ _id: id, userId: request.user?.userId })
    if (!deleted) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Invoice deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})