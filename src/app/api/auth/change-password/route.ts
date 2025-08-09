import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    {
      id: '1',
      email: 'admin@example.com',
      password: bcrypt.hashSync('password123', 10),
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

function saveUsers(users: User[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users file:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get users and find current user
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === decoded.userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[userIndex];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    users[userIndex] = {
      ...user,
      password: hashedNewPassword,
      updatedAt: new Date().toISOString()
    };

    // Save updated users
    const saved = saveUsers(users);
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}