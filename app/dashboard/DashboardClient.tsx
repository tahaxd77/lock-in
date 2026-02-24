'use client';

import React, { useEffect } from 'react';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { FriendsList } from '@/components/presence/FriendsList';
import { NudgeToast } from '@/components/social/NudgeToast';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { Leaderboard } from '@/components/social/Leaderboard';
import { useTimerStore } from '@/store/timerStore';
import { usePresence } from '@/hooks/usePresence';
import { useNudgeListener } from '@/hooks/useNudgeListener';
import { usePresenceStore } from '@/store/presenceStore';
import {
  Card,
  CardContent,
} from '@/components/ui/Card';

interface Profile {
  id: string;
  username: string | null;
  total_focus_hours: number;
  current_status: string | null;
}

interface DashboardClientProps {
  profile: Profile;
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const timerStatus = useTimerStore((s) => s.status);
  const timerSubject = useTimerStore((s) => s.subject);
  const { broadcastStatus } = usePresence(profile.id);
  const onlineCount = usePresenceStore((s) => s.onlineCount);

  // Subscribe to incoming nudges
  useNudgeListener(profile.id);

  // Broadcast status changes to the presence channel
  useEffect(() => {
    if (timerStatus === 'running') {
      broadcastStatus('focusing', timerSubject, new Date().toISOString());
    } else if (timerStatus === 'paused') {
      broadcastStatus('break');
    } else {
      broadcastStatus('idle');
    }
  }, [timerStatus, timerSubject, broadcastStatus]);

  const statusIcon =
    timerStatus === 'running' ? '🎯' :
    timerStatus === 'paused' ? '⏸️' : '💤';

  const statusLabel =
    timerStatus === 'running' ? 'Focusing' :
    timerStatus === 'paused' ? 'Paused' : 'Idle';

  return (
    <>
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Focus Hours',
            value: String(profile.total_focus_hours || 0),
            icon: '⏱️',
          },
          {
            label: 'Current Status',
            value: statusLabel,
            icon: statusIcon,
            isText: true,
          },
          { label: 'Current Streak', value: '0', icon: '🔥' },
          {
            label: 'Friends Active',
            value: onlineCount > 0 ? String(onlineCount) : '0',
            icon: '👥',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    stat.isText
                      ? 'capitalize text-foreground'
                      : 'text-accent-focus timer-display'
                  }`}
                >
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
        <FocusTimer userId={profile.id} />

        {/* Right Sidebar */}
        <div className="space-y-6" data-slot="friends-sidebar">
          <FriendsList currentUserId={profile.id} />
          <ActivityFeed currentUserId={profile.id} />
          <Leaderboard />
        </div>
      </div>

      {/* Nudge Toast — floating, bottom-right */}
      <NudgeToast />
    </>
  );
}
