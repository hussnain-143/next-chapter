'use client';

import { Award, Flame, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../lib/api';
import Link from 'next/link';
import { useSyncDashboardUser } from '../../hooks/useSyncDashboardUser';

export default function Header() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 15000,
  });

  useSyncDashboardUser(stats);

  return (
    <header className="header-bar h-14 flex items-center justify-between px-6 shrink-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="pill-streak flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold">
          <Flame className="w-3.5 h-3.5 text-gold" style={{ fill: 'color-mix(in srgb, var(--gold) 35%, transparent)' }} />
          <span>{stats?.streak ?? 0} day streak</span>
        </div>

        <div className="pill-xp flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold">
          <Award className="w-3.5 h-3.5 text-primary" />
          <span>{stats?.totalXP ?? 0} XP</span>
        </div>
      </div>

      <Link
        href="/search"
        className="header-search flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-background border border-border text-sidebar-muted">
          ⌘K
        </kbd>
      </Link>
    </header>
  );
}
