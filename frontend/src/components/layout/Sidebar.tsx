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
    <aside data-sidebar className="w-[240px] shrink-0 flex flex-col h-screen overflow-y-auto select-none">
      <div className="flex items-center gap-3 px-5 py-[18px] sidebar-brand-border">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
          <Image src="/logo.png" alt="Next Chapter" width={36} height={36} priority className="object-cover w-full h-full" />
        </div>
        <div>
          <p className="font-extrabold text-[14px] tracking-tight gradient-text leading-none">Next Chapter</p>
          <p className="sidebar-section-label mt-0.5 tracking-widest">Learn · Track · Grow</p>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-5 pb-3 space-y-5 overflow-y-auto">
        <div className="space-y-0.5">
          <p className="sidebar-section-label px-3 mb-2">Workspace</p>

          {mainNav.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'sidebar-nav-item group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  active ? 'sidebar-nav-active' : 'sidebar-nav-inactive'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-[17px] h-[17px] shrink-0 transition-transform duration-150',
                      active ? 'text-white' : 'sidebar-nav-icon group-hover:scale-110'
                    )}
                  />
                  <span className={active ? 'text-white font-semibold' : 'sidebar-nav-label'}>{label}</span>
                </div>
                {badge && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                      active ? 'sidebar-badge-active' : 'sidebar-badge-inactive'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3">
            <p className="sidebar-section-label">My Subjects</p>
            <Link href="/subjects" className="text-[10px] font-semibold sidebar-link-accent hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-0.5">
            {subjects.length === 0 ? (
              <p className="text-[11px] px-3 py-2 italic text-sidebar-muted">No subjects yet</p>
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
                    <span className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20" style={{ backgroundColor: sub.color }} />
                    <span className="truncate flex-1">{sub.name}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {user && (
        <Link href="/profile" className="sidebar-profile-footer group mx-3 mb-3 p-3.5 rounded-2xl block transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white font-bold text-[13px] shadow-lg shrink-0 group-hover:scale-105 transition-transform">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold truncate leading-none text-sidebar-text">{user.username}</p>
              <p className="text-[10px] font-mono mt-0.5 text-sidebar-muted">Lv.{user.level} Scholar</p>
            </div>
            <Zap className="w-3.5 h-3.5 shrink-0 text-gold" />
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[9.5px] font-semibold font-mono text-sidebar-muted">
              <span>{user.xp % 1000} XP</span>
              <span>1000 XP</span>
            </div>
            <div className="w-full h-[5px] rounded-full overflow-hidden sidebar-xp-track">
              <div
                className="h-full rounded-full sidebar-xp-fill transition-[width] duration-500 ease-out"
                style={{ width: `${Math.min((user.xp % 1000) / 10, 100)}%` }}
              />
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
