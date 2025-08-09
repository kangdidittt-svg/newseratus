import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import Project from '@/models/Project';
import connectDB from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    
    // Get user data before deletion to handle avatar cleanup
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete user's avatar file if it exists and is not default
    if (user.avatar && !user.avatar.includes('placeholder')) {
      try {
        const avatarPath = path.join(process.cwd(), 'public', user.avatar.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (error) {
        console.error('Error deleting avatar file:', error);
      }
    }
    
    // Delete all projects associated with the user
    await Project.deleteMany({ userId });
    
    // Reset user data (keep account but clear personal data)
    await User.findByIdAndUpdate(userId, {
      $unset: {
        avatar: 1,
        notifications: 1,
        language: 1,
        timezone: 1,
        profile: 1,
        preferences: 1,
        business: 1
      }
    });

    return NextResponse.json(
      { message: 'All user data cleared successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error clearing user data:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to clear user data' },
      { status: 500 }
    );
  }
}