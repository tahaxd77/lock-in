'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { UserStatus } from '@/store/presenceStore';

interface StatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; icon: string; dotClass: string; badgeClass: string }
> = {
  focusing: {
    label: 'Focusing',
    icon: '🎯',
    dotClass: 'bg-accent-focus',
    badgeClass: 'border-accent-focus/30 text-accent-focus',
  },
  break: {
    label: 'On Break',
    icon: '☕',
    dotClass: 'bg-accent-break',
    badgeClass: 'border-accent-break/30 text-accent-break',
  },
  idle: {
    label: 'Idle',
    icon: '💤',
    dotClass: 'bg-muted-foreground',
    badgeClass: 'border-border text-muted-foreground',
  },
  offline: {
    label: 'Offline',
    icon: '⚫',
    dotClass: 'bg-muted-foreground/40',
    badgeClass: 'border-border text-muted-foreground/60',
  },
};

export function StatusBadge({
  status,
  size = 'sm',
  showLabel = true,
}: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium',
        cfg.badgeClass,
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        size === 'md' && 'text-xs px-2 py-0.5'
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full',
          cfg.dotClass,
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'focusing' && 'animate-pulse'
        )}
      />
      {showLabel && cfg.label}
    </Badge>
  );
}
