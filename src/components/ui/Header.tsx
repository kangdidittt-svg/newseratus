import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header className={cn(
      'bg-white border-b border-gray-200',
      'px-6 py-4',
      className
    )}>
      {children}
    </header>
  );
}

interface HeaderTitleProps {
  children: ReactNode;
  className?: string;
}

export function HeaderTitle({ children, className }: HeaderTitleProps) {
  return (
    <h1 className={cn('text-xl font-semibold text-gray-900', className)}>
      {children}
    </h1>
  );
}

interface HeaderActionsProps {
  children: ReactNode;
  className?: string;
}

export function HeaderActions({ children, className }: HeaderActionsProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {children}
    </div>
  );
}