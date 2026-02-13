import Link from 'next/link';
import { Navigation } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const features = [
  { icon: '⏱️', title: 'Pomodoro Timer', description: 'Built-in focus timer with customizable work and break intervals. Stay on track with visual and audio notifications.' },
  { icon: '👥', title: 'Study Together', description: 'See when your friends are focusing in real-time. Build accountability and motivate each other to stay productive.' },
  { icon: '📊', title: 'Track Progress', description: 'Monitor your focus hours, streaks, and productivity patterns. Visualize your improvement over time.' },
  { icon: '🔒', title: 'Focus Lock', description: 'Optional app blocking during focus sessions. Eliminate distractions and commit fully to your work.' },
  { icon: '🏆', title: 'Achievements', description: 'Earn badges and unlock milestones as you build consistent study habits. Celebrate your wins!' },
  { icon: '🌙', title: 'Beautiful Dark UI', description: 'Sleek, modern interface designed for extended study sessions. Easy on the eyes, beautiful to use.' },
];

const stats = [
  { value: '25:00', label: 'Focus Session Length' },
  { value: '∞', label: 'Study Sessions' },
  { value: '100%', label: 'Free Forever' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={false} />

      {/* ── Hero ── */}
      <section className="relative px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36">
        {/* Decorative blurs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-0 top-20 h-[450px] w-[450px] rounded-full bg-accent-focus/15 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-accent-break/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 text-sm">
            🎯 Free &amp; Open Source
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-accent-focus to-accent-focus/60 bg-clip-text text-transparent">
              Study Together.
            </span>
            <br />
            Stay Accountable.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Join your friends in virtual study sessions with real-time
            accountability. Build momentum, track progress, and achieve your
            goals together.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-accent-focus text-black font-semibold hover:bg-accent-focus/90 px-8"
              >
                Get Started — It&apos;s Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Features ── */}
      <section className="px-6 lg:px-8 py-20 sm:py-28 lg:py-32 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center mb-14 lg:mb-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to{' '}
              <span className="text-accent-focus">Stay Focused</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to help you and your friends maintain
              productivity and build lasting study habits.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="transition-colors hover:border-accent-focus/40"
              >
                <CardHeader>
                  <div className="text-3xl mb-1">{f.icon}</div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Stats ── */}
      <section className="px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="py-8">
              <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 text-center">
                {stats.map((s) => (
                  <div key={s.label} className="py-6 sm:py-0 sm:px-6">
                    <div className="text-4xl font-bold text-accent-focus timer-display sm:text-5xl">
                      {s.value}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground font-medium">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ── CTA ── */}
      <section className="px-6 lg:px-8 py-20 sm:py-28 lg:py-32 bg-muted/30">
        <div className="mx-auto max-w-2xl">
          <Card className="text-center border-accent-focus/20">
            <CardContent className="py-12 sm:py-16 flex flex-col items-center gap-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Level Up Your Productivity?
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                Join FocusFriends today and start building better study habits
                with your friends.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-accent-focus text-black font-semibold hover:bg-accent-focus/90 px-10 mt-2"
                >
                  Create Free Account ✨
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © 2026 FocusFriends. Built with focus, designed for productivity.
        </div>
      </footer>
    </div>
  );
}
