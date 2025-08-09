import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${request.user?.userId}_${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user avatar in database
    const avatarUrl = `/uploads/avatars/${filename}`;
    await User.findByIdAndUpdate(
      request.user?.userId,
      { avatar: avatarUrl },
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Avatar updated successfully',
        avatarUrl
      },
      { status: 200 }
    );
  } catch (error: unknown) {
      console.error('Avatar upload error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
  }
});