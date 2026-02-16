'use client';

import { create } from 'zustand';

export type UserStatus = 'focusing' | 'break' | 'idle' | 'offline';

export interface FriendPresence {
  id: string;
  username: string;
  avatarUrl: string | null;
  status: UserStatus;
  subject?: string;
  sessionStart?: string;
  totalFocusHours: number;
}

interface PresenceState {
  friends: FriendPresence[];
  onlineCount: number;
  isConnected: boolean;
}

interface PresenceActions {
  setFriends: (friends: FriendPresence[]) => void;
  updateFriend: (id: string, updates: Partial<FriendPresence>) => void;
  removeFriend: (id: string) => void;
  setConnected: (connected: boolean) => void;
}

export const usePresenceStore = create<PresenceState & PresenceActions>()(
  (set, get) => ({
    // State
    friends: [],
    onlineCount: 0,
    isConnected: false,

    // Actions
    setFriends: (friends) =>
      set({
        friends,
        onlineCount: friends.filter((f) => f.status !== 'offline').length,
      }),

    updateFriend: (id, updates) =>
      set((state) => {
        const newFriends = state.friends.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        );
        return {
          friends: newFriends,
          onlineCount: newFriends.filter((f) => f.status !== 'offline').length,
        };
      }),

    removeFriend: (id) =>
      set((state) => {
        const newFriends = state.friends.filter((f) => f.id !== id);
        return {
          friends: newFriends,
          onlineCount: newFriends.filter((f) => f.status !== 'offline').length,
        };
      }),

    setConnected: (connected) => set({ isConnected: connected }),
  })
);
