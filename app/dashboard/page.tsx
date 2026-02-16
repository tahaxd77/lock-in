import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/ui/Navigation';
import { DashboardClient } from './DashboardClient';

interface Profile {
  id: string;
  username: string | null;
  total_focus_hours: number;
  current_status: string | null;
  created_at?: string;
  updated_at?: string;
}

async function signOut() {
  'use server';
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null };

  const safeProfile: Profile = profile ?? {
    id: user.id,
    username: user.email?.split('@')[0] ?? 'Friend',
    total_focus_hours: 0,
    current_status: 'idle',
  };

  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={true} username={safeProfile.username || 'Friend'} />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome back,{' '}
              <span className="text-accent-focus">{safeProfile.username || 'Friend'}</span>! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ready to focus and make today productive?
            </p>
          </div>

          {/* Sign Out */}
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* ── Interactive Dashboard ── */}
        <DashboardClient profile={safeProfile} />
      </main>
    </div>
  );
}