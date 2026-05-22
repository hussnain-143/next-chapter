'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../lib/api';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import { 
  BookOpen, 
  Hourglass, 
  Sparkles, 
  Trophy, 
  CheckCircle,
  TrendingUp,
  Brain,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-accent/20 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-accent/20 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-accent/20 rounded-2xl"></div>
          <div className="h-72 bg-accent/20 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Failed to connect to the backend API</h3>
      </div>
    );
  }

  const formatHours = (seconds: number) => {
    const hrs = seconds / 3600;
    if (hrs < 1) {
      return `${Math.round(seconds / 60)} Mins`;
    }
    return `${hrs.toFixed(1)} Hrs`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, Scholar <Sparkles className="w-5 h-5 text-[#F59E0B] animate-bounce" />
          </h2>
          <p className="text-sm text-muted-foreground">Here is a summary of your active learning workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ai"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl btn-gradient"
          >
            <Brain className="w-4 h-4" />
            <span>AI Coach Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Subjects Active"
          value={stats.totalSubjects}
          description="In learning queue"
          icon={BookOpen}
          variant="violet"
        />
        <StatsCard
          title="Study Duration"
          value={formatHours(stats.totalTimeSpent)}
          description="Total hours logged"
          icon={Hourglass}
          variant="amber"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description={`${stats.completedLessons}/${stats.totalLessons} lessons`}
          icon={CheckCircle}
          variant="emerald"
        />
        <StatsCard
          title="Productivity Score"
          value={stats.productivityScore}
          description="Daily consistency rating"
          icon={TrendingUp}
          variant="rose"
        />
      </div>

      {/* Charts & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap & Weekly progress chart */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyChart data={stats.weeklyData} />
          <ActivityHeatmap data={stats.heatmapData} />
        </div>

        {/* Activity Timeline */}
        <div className="h-full">
          <ActivityTimeline logs={stats.recentActivity} />
        </div>
      </div>

      {/* Quick Access Subjects list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Subject Progress overview</h4>
            <p className="text-xs text-muted-foreground">Active syllabus details</p>
          </div>
          <Link href="/subjects" className="text-xs gradient-text hover:opacity-80 font-semibold flex items-center gap-1">
            <span>All Subjects</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>

        {stats.subjectProgress.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">You haven&apos;t created any subjects yet.</p>
            <Link
              href="/subjects"
              className="inline-block px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-primary/5 hover:text-primary transition duration-200"
            >
              Add Subject
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.subjectProgress.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/10"
                    style={{ backgroundColor: `${sub.color}15`, color: sub.color }}
                  >
                    {(() => {
                      // Dynamically render Lucide icon based on name
                      const icons = require('lucide-react');
                      const IconComp = icons[sub.icon] || icons.Book;
                      return <IconComp className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground truncate max-w-[170px]">{sub.name}</h5>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {sub.completedLessons}/{sub.totalLessons} Lessons
                    </span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1.5 mt-4">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground font-mono">
                    <span>Syllabus Completed</span>
                    <span>{sub.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: sub.color, width: `${sub.progress}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
