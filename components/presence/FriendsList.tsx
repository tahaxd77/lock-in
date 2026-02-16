'use client';

import React from 'react';
import { useFriends } from '@/hooks/useFriends';
import { usePresence } from '@/hooks/usePresence';
import { FriendCard } from '@/components/presence/FriendCard';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import { usePresenceStore } from '@/store/presenceStore';

interface FriendsListProps {
  currentUserId: string;
}

export function FriendsList({ currentUserId }: FriendsListProps) {
  const { friends, loading, error } = useFriends(currentUserId);
  const { isConnected } = usePresence(currentUserId);
  const onlineCount = usePresenceStore((s) => s.onlineCount);

  return (
    <Card data-slot="friends-sidebar">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CardTitle>Friends</CardTitle>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {onlineCount > 0 ? `${onlineCount} online` : 'none online'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isConnected ? 'bg-accent-focus' : 'bg-muted-foreground/40'
              }`}
              title={isConnected ? 'Live' : 'Connecting…'}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="py-8 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-accent-focus" />
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          </div>
        )}

        {error && (
          <p className="py-4 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && friends.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm text-muted-foreground">
              No friends yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Other users who sign up will appear here automatically!
            </p>
          </div>
        )}

        {!loading && !error && friends.length > 0 && (
          <div className="max-h-[360px] -mx-2 space-y-0.5 overflow-y-auto pr-1">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
