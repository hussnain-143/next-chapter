'use client';

import { useQuery } from '@tanstack/react-query';
import { getWeeklyReport, getSessions } from '../../lib/api';
import { 
  BarChart2, 
  Clock, 
  Hourglass, 
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function Analytics() {
  const { data: report, isLoading: loadingReport } = useQuery({
    queryKey: ['weeklyReport'],
    queryFn: getWeeklyReport,
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions(30),
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} Mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-primary/10 text-primary border-primary/20';
      case 'review': return 'bg-gold/10 text-gold border-gold/20';
      case 'quiz': return 'bg-primary/10 text-primary border-primary/20';
      case 'practice': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Analytics Hub</h2>
        <p className="text-sm text-muted-foreground">Deep dive into your weekly learning reports and logs.</p>
      </div>

      {/* KPI stats bar */}
      {loadingReport ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-accent/20 rounded-2xl"></div>
          ))}
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weekly Time</span>
              <h3 className="text-lg font-bold text-foreground">{formatDuration(report.totalStudyTime)}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sessions Finished</span>
              <h3 className="text-lg font-bold text-foreground">{report.sessionsCompleted}</h3>
            </div>
            <div className="p-3 bg-gold/10 text-gold rounded-xl border border-gold/20">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lessons Completed</span>
              <h3 className="text-lg font-bold text-foreground">{report.lessonsCompleted}</h3>
            </div>
            <div className="p-3 bg-accent/10 text-accent rounded-xl border border-accent/20">
              <BarChart2 className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pomodoros Run</span>
              <h3 className="text-lg font-bold text-foreground">{report.totalPomodoros}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Hourglass className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Execution Study sessions logs */}
      <div className="glass-card rounded-3xl overflow-hidden border border-border/40">
        <div className="p-6 border-b border-border/40 flex justify-between items-center bg-accent/5">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Study Sessions History</h3>
            <p className="text-xs text-muted-foreground">Detailed log of learning execution logs</p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {loadingSessions ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-10 rounded-2xl bg-accent/20" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground italic">No study sessions logged. Connect Pomodoro or log a session.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold uppercase bg-accent/15 select-none">
                  <th className="p-4 pl-6">Subject</th>
                  <th className="p-4">Lesson node</th>
                  <th className="p-4">Execution Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Pomodoros</th>
                  <th className="p-4 pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-accent/10 transition">
                    <td className="p-4 pl-6 font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.subjectId?.color || 'var(--primary)' }}></span>
                        <span className="truncate max-w-[120px]">{s.subjectId?.name || 'General Space'}</span>
                      </div>
                    </td>
                    <td className="p-4 truncate max-w-[200px]">{s.lessonId?.title || 'Subject Syllabus'}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${getSessionTypeColor(s.type)}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold">{formatDuration(s.duration)}</td>
                    <td className="p-4 font-mono">{s.pomodoroCount || 0}</td>
                    <td className="p-4 text-muted-foreground pr-6 font-mono font-semibold uppercase">
                      {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
