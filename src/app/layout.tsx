import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import GlobalSearchCommandPalette from '@/components/GlobalSearchCommandPalette';
import StudioRobot from '@/components/StudioRobot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewSeratus - Freelance Project Tracker',
  description: 'Modern, futuristic dashboard for tracking freelance projects with beautiful animations',
  keywords: 'freelance, project management, dashboard, tracking, modern UI, PWA',
  authors: [{ name: 'NewSeratus Studio' }],
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NewSeratus',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'NewSeratus',
    title: 'NewSeratus - Freelance Project Tracker',
    description: 'Modern, futuristic dashboard for tracking freelance projects',
  },
  twitter: {
    card: 'summary',
    title: 'NewSeratus - Freelance Project Tracker',
    description: 'Modern, futuristic dashboard for tracking freelance projects',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NewSeratus" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen relative`} suppressHydrationWarning={true}>
        <AuthProvider>
          <div id="root" className="relative z-10">{children}</div>
          <GlobalSearchCommandPalette />
          <div className="hidden md:block">
            <StudioRobot />
          </div>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
