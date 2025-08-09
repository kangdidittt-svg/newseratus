import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const user = await User.findById(request.user?.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        settings: {
          profile: {
            avatar: user.avatar || '/api/placeholder/150/150'
          },
          preferences: {
            notifications: user.notifications || {
              email: true,
              push: true,
              sms: false
            },
            language: user.language || 'en',
            timezone: user.timezone || 'America/New_York'
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();
    
    const { settings } = await request.json();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      );
    }

    const updateData: {
      avatar?: string;
      notifications?: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      language?: string;
      timezone?: string;
    } = {};
    
    // Update avatar if provided
    if (settings.profile?.avatar) {
      updateData.avatar = settings.profile.avatar;
    }
    
    // Update notifications if provided
    if (settings.preferences?.notifications) {
      updateData.notifications = settings.preferences.notifications;
    }
    
    // Update language if provided
    if (settings.preferences?.language) {
      updateData.language = settings.preferences.language;
    }
    
    // Update timezone if provided
    if (settings.preferences?.timezone) {
      updateData.timezone = settings.preferences.timezone;
    }

    const updatedUser = await User.findByIdAndUpdate(
      request.user?.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Settings updated successfully',
        settings: {
          profile: {
            avatar: updatedUser.avatar || '/api/placeholder/150/150'
          },
          preferences: {
            notifications: updatedUser.notifications || {
              email: true,
              push: true,
              sms: false
            },
            language: updatedUser.language || 'en',
            timezone: updatedUser.timezone || 'America/New_York'
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});