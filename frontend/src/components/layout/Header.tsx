'use client';

import { Award, Flame, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../lib/api';
import Link from 'next/link';

export default function Header() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 15000,
  });

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0 z-40"
      style={{
        background:   '#252244',
        borderBottom: '1px solid #352F60',
        boxShadow:    '0 1px 8px rgba(0,0,0,0.25)',
      }}
    >
      {/* Left — stat pills */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
          style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.22)', color: '#FCD34D' }}
        >
          <Flame className="w-3.5 h-3.5" style={{ fill: 'rgba(252,211,77,0.4)', color: '#FBBF24' }} />
          <span>{stats?.streak ?? 0} day streak</span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.24)', color: '#C4B5FD' }}
        >
          <Award className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
          <span>{stats?.totalXP ?? 0} XP</span>
        </div>
      </div>

      {/* Right — search */}
      <Link
        href="/search"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all duration-150"
        style={{ background: '#2D2A52', border: '1px solid #352F60', color: '#9B8EC4' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#8B5CF6';
          (e.currentTarget as HTMLElement).style.color = '#C4B5FD';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#352F60';
          (e.currentTarget as HTMLElement).style.color = '#9B8EC4';
        }}
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search</span>
        <kbd
          className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
          style={{ background: '#1C1A2E', border: '1px solid #352F60', color: '#6B6490' }}
        >
          ⌘K
        </kbd>
      </Link>
    </header>
  );
}
