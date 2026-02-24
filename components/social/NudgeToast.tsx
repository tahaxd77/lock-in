'use client';

import React from 'react';
import { useToastStore } from '@/store/toastStore';
import { cn } from '@/lib/utils';

export function NudgeToast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md',
            'animate-in slide-in-from-right-10 fade-in duration-300',
            'cursor-pointer hover:bg-accent/50 transition-colors',
            'max-w-xs'
          )}
          style={{ animationDelay: `${i * 50}ms` }}
          onClick={() => dismiss(toast.id)}
          role="alert"
        >
          <span className="text-2xl shrink-0">{toast.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{toast.message}</p>
            <p className="text-[10px] text-muted-foreground">just now</p>
          </div>
        </div>
      ))}
    </div>
  );
}
