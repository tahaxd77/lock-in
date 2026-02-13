'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isAuthenticated?: boolean;
  username?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ isAuthenticated, username }) => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-focus text-sm font-bold text-black">
            F
          </div>
          <span className="text-lg font-bold tracking-tight">FocusFriends</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <div className="ml-2 flex items-center gap-2 rounded-full border px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">{username}</span>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant={pathname === '/login' ? 'secondary' : 'ghost'}
                  size="sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className={cn(
                    'bg-accent-focus text-black font-semibold hover:bg-accent-focus/90',
                    pathname === '/signup' && 'ring-2 ring-accent-focus/50'
                  )}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
