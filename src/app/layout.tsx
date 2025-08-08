import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seratus Studio - Project Management',
  description: 'Professional project management and tracking system',
  keywords: 'project management, freelance, tracking, dashboard',
  authors: [{ name: 'Seratus Studio' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <div id="root">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
