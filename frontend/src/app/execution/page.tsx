'use client';

import { useQuery } from '@tanstack/react-query';
import { getExecutionLogs } from '../../lib/api';
import { 
  Play, 
  CheckCircle2, 
  Bookmark, 
  HelpCircle, 
  FileText, 
  Code,
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react';

export default function ExecutionTracker() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['executionLogs'],
    queryFn: () => getExecutionLogs(50),
  });

  const getActionDetails = (action: string) => {
    switch (action) {
      case 'started':
        return { icon: Play, color: 'text-accent border-accent/20 bg-accent/10', label: 'Started Lesson' };
      case 'completed':
        return { icon: CheckCircle2, color: 'text-primary border-primary/20 bg-primary/10', label: 'Completed Lesson' };
      case 'revised':
        return { icon: RefreshCw, color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', label: 'Revised Lesson' };
      case 'bookmarked':
        return { icon: Bookmark, color: 'text-blue-500 border-blue-500/20 bg-blue-500/10', label: 'Bookmarked' };
      case 'quiz_taken':
        return { icon: HelpCircle, color: 'text-primary border-primary/20 bg-primary/10', label: 'Took Quiz' };
      case 'note_added':
        return { icon: FileText, color: 'text-accent border-accent/20 bg-accent/10', label: 'Edited Notes' };
      case 'code_added':
        return { icon: Code, color: 'text-pink-500 border-pink-500/20 bg-pink-500/10', label: 'Added Code' };
      default:
        return { icon: Clock, color: 'text-slate-500 border-slate-500/20 bg-slate-500/10', label: 'Log Recorded' };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Execution logs tracker <Activity className="w-5.5 h-5.5 text-primary" />
          </h2>
          <p className="text-sm text-muted-foreground">Every learning action tracked, logged, and scored.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-border/40">
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">Loading execution logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground italic">No learning actions logged. Start studying or revising to generate logs!</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold uppercase bg-accent/15 select-none">
                  <th className="p-4 pl-6">Action Type</th>
                  <th className="p-4">Subject Space</th>
                  <th className="p-4">Chapter Block</th>
                  <th className="p-4">Lesson Node</th>
                  <th className="p-4">Details Notes</th>
                  <th className="p-4 pr-6">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {logs.map((log) => {
                  const details = getActionDetails(log.action);
                  const Icon = details.icon;
                  return (
                    <tr key={log._id} className="hover:bg-accent/10 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${details.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-foreground">{details.label}</span>
                        </div>
                      </td>
                      <td className="p-4 truncate max-w-[120px] font-semibold">
                        {log.subjectId?.name || 'General Space'}
                      </td>
                      <td className="p-4 truncate max-w-[120px] text-muted-foreground">
                        {log.chapterId?.title || 'General'}
                      </td>
                      <td className="p-4 truncate max-w-[150px]">
                        {log.lessonId?.title || 'Syllabus Grid'}
                      </td>
                      <td className="p-4">
                        {log.notes ? (
                          <span className="text-[10px] bg-accent/30 border border-border/40 px-2 py-0.5 rounded font-medium text-muted-foreground">
                            {log.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 italic">-</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground pr-6 font-mono font-semibold uppercase">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
