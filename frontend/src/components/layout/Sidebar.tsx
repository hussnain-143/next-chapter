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
  Activity, 
  MessageSquare, 
  Timer, 
  Search, 
  CalendarRange,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });
  const user = useAuthStore((state) => state.user);

  const mainNav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/learning-path', label: 'Learning Paths', icon: CalendarRange },
    { href: '/graph', label: 'Knowledge Graph', icon: GitFork },
    { href: '/ai', label: 'AI Assistant', icon: MessageSquare, badge: 'New' },
  ];

  return (
    <aside className="w-64 border-r border-border/50 bg-card/80 backdrop-blur-2xl flex flex-col h-screen overflow-y-auto shrink-0 select-none">
      {/* Brand Header with Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
        <Image
          src="/logo.png"
          alt="Next Chapter"
          width={40}
          height={40}
          className="rounded-xl shadow-md"
          priority
        />
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-foreground text-[15px] gradient-text">Next Chapter</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Learn · Track · Grow</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-5 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2 block">
            Workspace
          </span>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4.5 h-4.5 transition-all duration-200 group-hover:scale-110", isActive ? "" : "text-muted-foreground group-hover:text-primary")} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    isActive ? "bg-white/20 text-white" : "bg-gradient-to-r from-primary/15 to-accent/15 text-primary"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Subjects Sublist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              My Subjects
            </span>
            <Link href="/subjects" className="text-[10px] text-primary hover:underline font-medium">
              Manage
            </Link>
          </div>
          <div className="space-y-0.5 max-h-[220px] overflow-y-auto pr-1">
            {subjects.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-1.5 italic">No subjects added yet</p>
            ) : (
              subjects.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/subjects/${sub._id}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all duration-200",
                    pathname.startsWith(`/subjects/${sub._id}`) && "text-foreground bg-primary/10 font-semibold"
                  )}
                >
                  <div className="flex items-center gap-2 max-w-[85%] truncate">
                    <span className="text-sm shrink-0">{sub.icon}</span>
                    <span className="truncate">{sub.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Gamification Profile Footer */}
      {user && (
        <Link href="/profile" className="p-4 border-t border-border/40 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent flex flex-col gap-2 hover:bg-primary/10 transition group cursor-pointer block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary via-accent to-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 transition">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">{user.username}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Level {user.level} Scholar</span>
            </div>
          </div>
          
          {/* Simple XP Progress Bar */}
          <div className="mt-1 space-y-1">
            <div className="flex justify-between text-[9px] font-semibold text-muted-foreground font-mono">
              <span>XP Progress</span>
              <span>{user.xp % 1000} / 1000 XP</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-700" 
                style={{ width: `${(user.xp % 1000) / 10}%` }}
              ></div>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
