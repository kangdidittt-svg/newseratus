import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Seratus Studio - Freelance Project Tracker',
  description: 'Modern, futuristic dashboard for tracking freelance projects with beautiful animations',
  keywords: 'freelance, project management, dashboard, tracking, modern UI',
  authors: [{ name: 'Seratus Studio' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen relative`} suppressHydrationWarning={true}>
        <AuthProvider>
          <div id="root" className="relative z-10">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
