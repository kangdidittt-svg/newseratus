import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className={cn('md:hidden min-h-screen bg-gray-50', className)}>
      {children}
    </div>
  );
}

interface DesktopLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DesktopLayout({ children, className }: DesktopLayoutProps) {
  return (
    <div className={cn('hidden md:flex min-h-screen bg-gray-50', className)}>
      {children}
    </div>
  );
}