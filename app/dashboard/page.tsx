import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navigation } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

  const statusIcon =
    profile?.current_status === 'focusing' ? '🎯' :
    profile?.current_status === 'break' ? '☕' : '💤';

  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={true} username={profile?.username || 'Friend'} />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8 space-y-8">
        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Welcome back,{' '}
            <span className="text-accent-focus">{profile?.username || 'Friend'}</span>! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ready to focus and make today productive?
          </p>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Focus Hours', value: String(profile?.total_focus_hours || 0), icon: '⏱️' },
            { label: 'Current Status', value: profile?.current_status || 'Idle', icon: statusIcon, isText: true },
            { label: 'Current Streak', value: '0', icon: '🔥' },
            { label: 'Friends Active', value: '0', icon: '👥' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${stat.isText ? 'capitalize text-foreground' : 'text-accent-focus timer-display'}`}>
                    {stat.value}
                  </p>
                </div>
                <span className="text-3xl opacity-50">{stat.icon}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Focus Timer — 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Focus Timer</CardTitle>
                <span className="text-2xl">⏱️</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="timer-display text-6xl font-bold text-accent-focus sm:text-7xl">
                  25:00
                </div>
                <p className="mt-2 text-muted-foreground">Pomodoro Focus Session</p>
              </div>

              {/* Task Input */}
              <Input placeholder="What are you working on?" />

              {/* Controls */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-accent-focus text-black font-semibold hover:bg-accent-focus/90">
                  Start Focus Session 🚀
                </Button>
                <Button variant="outline" size="icon">
                  ⚙️
                </Button>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-3">
                {['25 min', '50 min', '90 min'].map((preset) => (
                  <Button key={preset} variant="outline" size="sm">
                    {preset}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Friends */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Friends</CardTitle>
                  <Button variant="ghost" size="sm" className="text-accent-focus">
                    + Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No friends yet. Add friends to study together! 👥
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Start your first session to see activity here! 📊
                </p>
              </CardContent>
            </Card>

            {/* Sign Out */}
            <form action={signOut}>
              <Button type="submit" variant="destructive" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* ── Coming Soon ── */}
        <Card className="border-accent-focus/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="text-4xl">🚧</span>
            <div>
              <h3 className="font-bold">More Features Coming Soon!</h3>
              <p className="text-sm text-muted-foreground">
                Friends sync, achievements, statistics, and more awesome features
                are on the way in Phase 3.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}