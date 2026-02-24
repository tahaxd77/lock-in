'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { startOfWeek } from 'date-fns';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalMinutes: number;
  deepWorkSessions: number;
  rank: number;
}

/**
 * Queries sessions from current week, aggregates total focus time
 * per user, and returns sorted rankings.
 */
export function useLeaderboard() {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

      // Fetch all completed sessions this week
      const { data: sessions } = await supabase
        .from('sessions')
        .select('user_id, duration_minutes')
        .not('end_time', 'is', null)
        .gte('start_time', weekStart) as { data: any[] | null };

      if (!sessions || sessions.length === 0) {
        setRankings([]);
        setLoading(false);
        return;
      }

      // Aggregate per user
      const agg = new Map<string, { totalMinutes: number; deepWorkSessions: number }>();
      sessions.forEach((s: any) => {
        const dur = Number(s.duration_minutes) || 0;
        const prev = agg.get(s.user_id) ?? { totalMinutes: 0, deepWorkSessions: 0 };
        prev.totalMinutes += dur;
        if (dur > 50) prev.deepWorkSessions += 1;
        agg.set(s.user_id, prev);
      });

      // Fetch usernames
      const userIds = [...agg.keys()];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds) as { data: any[] | null };

      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.username ?? 'Unknown']));

      // Build sorted list
      const entries: LeaderboardEntry[] = [...agg.entries()]
        .map(([userId, stats]) => ({
          userId,
          username: nameMap.get(userId) ?? 'Unknown',
          totalMinutes: stats.totalMinutes,
          deepWorkSessions: stats.deepWorkSessions,
          rank: 0,
        }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes);

      // Assign ranks
      entries.forEach((e, i) => { e.rank = i + 1; });

      setRankings(entries);
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rankings, loading };
}
