'use client';

import { useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { Award, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../lib/api';
import { toast } from 'sonner';

export default function Header() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 15000, // Poll every 15s for achievements/xp
  });

  return (
    <header className="h-16 border-b border-border/50 bg-card/70 backdrop-blur-2xl flex items-center justify-between px-8 select-none shrink-0 z-40">
      {/* Stats Badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-600 dark:text-amber-400 font-semibold text-xs shadow-sm transition-all duration-200 hover:scale-105">
          <Flame className="w-4 h-4 fill-amber-500/30 animate-pulse" />
          <span>Streak: {stats?.streak || 0} Days</span>
        </div>
        
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/15 dark:to-accent/15 border border-primary/20 px-3.5 py-1.5 rounded-full text-primary font-semibold text-xs shadow-sm transition-all duration-200 hover:scale-105">
          <Award className="w-4 h-4" />
          <span>{stats?.totalXP || 0} XP</span>
        </div>
      </div>

      {/* Theme Toggle Actions */}
      <div className="flex items-center gap-5">
        <ThemeToggle />
      </div>
    </header>
  );
}
