'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { IDashboardStats } from '../types';

/** Keep sidebar XP/level/streak aligned with analytics API */
export function useSyncDashboardUser(stats: IDashboardStats | undefined) {
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    if (!stats) return;
    updateUser({
      xp: stats.totalXP,
      level: stats.userLevel ?? Math.max(1, Math.floor(stats.totalXP / 1000) + 1),
      streak: stats.streak,
    });
  }, [stats?.totalXP, stats?.userLevel, stats?.streak, updateUser]);
}
