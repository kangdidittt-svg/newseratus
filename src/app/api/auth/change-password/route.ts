import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { verifyPassword, hashPassword } from '@/lib/auth';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    await connectDB();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password saat ini dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal harus 6 karakter' },
        { status: 400 }
      );
    }

    const user = await User.findById(request.user?.userId).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(newPassword);
    user.password = hashed;
    await user.save();

    return NextResponse.json(
      { message: 'Password berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password. Silakan coba lagi.' },
      { status: 500 }
    );
  }
});