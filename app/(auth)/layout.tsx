import type { Metadata } from 'next';
import { Navigation } from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: 'Sign In - FocusFriends',
  description: 'Sign in to your FocusFriends account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={false} />
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
