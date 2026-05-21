'use client';

import { IExecutionLog } from '../../types';
import { 
  Play, 
  CheckCircle2, 
  Bookmark, 
  HelpCircle, 
  FileText, 
  Code,
  RefreshCw,
  Clock
} from 'lucide-react';

interface ActivityTimelineProps {
  logs: IExecutionLog[];
}

export default function ActivityTimeline({ logs = [] }: ActivityTimelineProps) {
  const getActionDetails = (action: string) => {
    switch (action) {
      case 'started':
        return { icon: Play, bg: 'bg-accent/10 text-accent border-accent/20', label: 'Started learning' };
      case 'completed':
        return { icon: CheckCircle2, bg: 'bg-primary/10 text-primary border-primary/20', label: 'Completed lesson' };
      case 'revised':
        return { icon: RefreshCw, bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Revised lesson' };
      case 'bookmarked':
        return { icon: Bookmark, bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Bookmarked' };
      case 'quiz_taken':
        return { icon: HelpCircle, bg: 'bg-primary/10 text-primary border-primary/20', label: 'Took AI Quiz' };
      case 'note_added':
        return { icon: FileText, bg: 'bg-accent/10 text-accent border-accent/20', label: 'Added notes' };
      case 'code_added':
        return { icon: Code, bg: 'bg-pink-500/10 text-pink-500 border-pink-500/20', label: 'Added code' };
      default:
        return { icon: Clock, bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20', label: 'Activity logged' };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Recent Activity Timeline</h4>
        <p className="text-xs text-muted-foreground">Real-time study execution tracker</p>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-6">No study actions tracked yet.</p>
        ) : (
          logs.map((log, idx) => {
            const details = getActionDetails(log.action);
            const Icon = details.icon;
            const logDate = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={log._id || idx} className="flex gap-4 relative group">
                {/* Connector Line */}
                {idx !== logs.length - 1 && (
                  <span className="absolute left-[17px] top-9 bottom-[-16px] w-[1.5px] bg-border/50 group-hover:bg-border transition duration-200"></span>
                )}

                {/* Circle Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${details.bg} transition-all duration-300 group-hover:scale-105 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pt-0.5 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {details.label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground font-semibold uppercase">
                      {logDate}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium block truncate">
                    {log.lessonId?.title || 'Subject Space'}
                  </span>
                  {log.notes && (
                    <span className="text-[10px] text-muted-foreground bg-accent/30 border border-border/40 px-2 py-0.5 rounded-md inline-block font-medium">
                      {log.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
