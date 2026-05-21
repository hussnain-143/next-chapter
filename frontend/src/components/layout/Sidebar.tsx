'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  LayoutDashboard,
  BookOpen,
  GitFork,
  MessageSquare,
  Search,
  CalendarRange,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const mainNav = [
  { href: '/',              label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/subjects',      label: 'Subjects',        icon: BookOpen },
  { href: '/learning-path', label: 'Learning Paths',  icon: CalendarRange },
  { href: '/graph',         label: 'Knowledge Graph', icon: GitFork },
  { href: '/search',        label: 'Search',          icon: Search },
  { href: '/ai',            label: 'AI Assistant',    icon: MessageSquare, badge: 'AI' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      data-sidebar
      className="w-[240px] shrink-0 flex flex-col h-screen overflow-y-auto select-none"
      style={{ background: '#0F0D1F', borderRight: '1px solid #2A2550' }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-[18px]"
        style={{ borderBottom: '1px solid #2A2550' }}
      >
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}>
          <Image src="/logo.png" alt="Next Chapter" width={36} height={36} priority className="object-cover w-full h-full" />
        </div>
        <div>
          <p className="font-extrabold text-[14px] tracking-tight gradient-text leading-none">Next Chapter</p>
          <p className="text-[9.5px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#6B6490' }}>
            Learn · Track · Grow
          </p>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pt-5 pb-3 space-y-5 overflow-y-auto">

        {/* Main links */}
        <div className="space-y-0.5">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-3 mb-2" style={{ color: '#6B6490' }}>
            Workspace
          </p>

          {mainNav.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  // base
                  'sidebar-nav-item group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  // active vs inactive
                  active ? 'sidebar-nav-active' : 'sidebar-nav-inactive'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn(
                    'w-[17px] h-[17px] shrink-0 transition-transform duration-150',
                    active
                      ? 'text-white'
                      : 'sidebar-nav-icon group-hover:scale-110'
                  )} />
                  <span className={active ? 'text-white font-semibold' : 'sidebar-nav-label'}>
                    {label}
                  </span>
                </div>
                {badge && (
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                    active ? 'sidebar-badge-active' : 'sidebar-badge-inactive'
                  )}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Subjects quick-list */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: '#6B6490' }}>
              My Subjects
            </p>
            <Link href="/subjects" className="text-[10px] font-semibold" style={{ color: '#8B5CF6' }}>
              Manage
            </Link>
          </div>

          <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-0.5">
            {subjects.length === 0 ? (
              <p className="text-[11px] px-3 py-2 italic" style={{ color: '#6B6490' }}>No subjects yet</p>
            ) : (
              subjects.map((sub) => {
                const active = pathname.startsWith(`/subjects/${sub._id}`);
                return (
                  <Link
                    key={sub._id}
                    href={`/subjects/${sub._id}`}
                    className={cn(
                      'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150',
                      active ? 'sidebar-subject-active' : 'sidebar-subject-inactive'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                    <span className="truncate flex-1">{sub.name}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {/* ── Profile footer ────────────────────────────────────────────────── */}
      {user && (
        <Link
          href="/profile"
          className="sidebar-profile-footer group mx-3 mb-3 p-3.5 rounded-2xl block transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white font-bold text-[13px] shadow-lg shrink-0 group-hover:scale-105 transition-transform">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold truncate leading-none" style={{ color: '#E9D5FF' }}>
                {user.username}
              </p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: '#7C6FA0' }}>
                Lv.{user.level} Scholar
              </p>
            </div>
            <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[9.5px] font-semibold font-mono" style={{ color: '#7C6FA0' }}>
              <span>{user.xp % 1000} XP</span>
              <span>1000 XP</span>
            </div>
            <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ background: '#2A2550' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((user.xp % 1000) / 10, 100)}%`,
                  background: 'linear-gradient(90deg, #6D28D9, #8B5CF6)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
