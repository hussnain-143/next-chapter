'use client';

import { useTimerStore } from '../../store/useTimerStore';
import { formatTime } from '../../lib/utils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { logSession } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PomodoroPage() {
  const queryClient = useQueryClient();
  const { 
    timeLeft, 
    isRunning, 
    mode, 
    pomodoroCount, 
    focusLength, 
    shortLength, 
    longLength,
    setMode, 
    setIsRunning, 
    resetTimer, 
    setLengths,
    tick,
  } = useTimerStore();

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom log manual session states
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDuration, setLogDuration] = useState(25);
  const [logNotes, setLogNotes] = useState('');
  const [logType, setLogType] = useState<'study' | 'review' | 'quiz' | 'practice'>('study');

  const logSessionMutation = useMutation({
    mutationFn: logSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowLogModal(false);
      setLogNotes('');
      toast.success('Study session logged successfully!');
    },
    onError: () => toast.error('Could not log session', { description: 'Please try again.' }),
  });

  const logFocusSession = useCallback(
    (minutes: number) => {
      const durationSec = minutes * 60;
      logSessionMutation.mutate({
        duration: durationSec,
        pomodoroCount: 1,
        startTime: new Date(Date.now() - durationSec * 1000).toISOString(),
        endTime: new Date().toISOString(),
        type: 'study',
        notes: 'Pomodoro focus session completed',
      });
    },
    [logSessionMutation]
  );

  const prevModeRef = useRef(mode);

  // Run countdown while timer is active
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const state = useTimerStore.getState();
      const prevMode = prevModeRef.current;
      const prevTime = state.timeLeft;
      state.tick();
      const next = useTimerStore.getState();
      if (prevMode === 'focus' && prevTime <= 1 && next.mode !== 'focus') {
        logFocusSession(state.focusLength);
        toast.success('Focus block complete!', { description: 'Session added to your analytics.' });
      }
      prevModeRef.current = next.mode;
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, logFocusSession]);

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    logSessionMutation.mutate({
      duration: logDuration * 60,
      pomodoroCount: Math.ceil(logDuration / 25),
      startTime: new Date(Date.now() - logDuration * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      type: logType,
      notes: logNotes,
    });
  };

  const handleLengthChange = (focus: number, short: number, long: number) => {
    setLengths(focus, short, long);
  };

  // Progress percentage calculation
  const totalLengthSeconds = (mode === 'focus' ? focusLength : mode === 'short' ? shortLength : longLength) * 60;
  const progressPercent = Math.min(100, Math.round(((totalLengthSeconds - timeLeft) / totalLengthSeconds) * 100));

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 flex flex-col items-center">
      
      <div className="text-center space-y-2 select-none">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          Pomodoro Study Box <Clock className="w-5.5 h-5.5 text-primary" />
        </h2>
        <p className="text-sm text-muted-foreground">Optimize focus states using time-boxed study execution blocks.</p>
      </div>

      {/* Large Glowing Timer Shell */}
      <div className="glass-card rounded-full w-80 h-80 flex flex-col items-center justify-center relative p-8 shadow-2xl transition duration-500 border border-primary/20 bg-card/40">
        
        {/* Progress SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="var(--border)"
            strokeWidth="4"
            fill="transparent"
            className="opacity-20"
          />
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="var(--ring)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={2 * Math.PI * 140 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Info inside circle */}
        <div className="space-y-3 text-center z-10 select-none">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-mono">
            {mode === 'focus' ? 'Focus Session' : 'Rest Block'}
          </span>
          <h1 className="text-5xl font-black tracking-tight text-foreground font-mono tabular-nums">
            {formatTime(timeLeft)}
          </h1>
          <div className="flex items-center justify-center gap-1 text-[10px] text-gold font-bold font-mono">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Finished: {pomodoroCount}</span>
          </div>
        </div>

      </div>

      {/* Mode pills */}
      <div className="flex gap-2.5 bg-accent/20 border border-border/60 p-1.5 rounded-2xl select-none">
        {(['focus', 'short', 'long'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold capitalize transition duration-300 ${
              mode === m
                ? 'bg-card text-foreground shadow-md border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m} Break
          </button>
        ))}
      </div>

      {/* Controllers */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105"
        >
          {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          className="w-11 h-11 rounded-full border border-border/60 bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground transition flex items-center justify-center"
          title="Reset Timer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-accent/40 transition"
          title="Manual log session"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Log</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="glass-card rounded-3xl p-6 w-full max-w-md space-y-4">
        <span className="text-xs font-bold text-foreground uppercase tracking-widest block border-b border-border/40 pb-2">Timer Configuration (Mins)</span>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Focus</label>
            <input
              type="number"
              value={focusLength}
              onChange={(e) => handleLengthChange(parseInt(e.target.value) || 25, shortLength, longLength)}
              className="w-full px-2.5 py-1.5 text-xs bg-accent/20 border border-border/80 rounded-lg text-center focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Short</label>
            <input
              type="number"
              value={shortLength}
              onChange={(e) => handleLengthChange(focusLength, parseInt(e.target.value) || 5, longLength)}
              className="w-full px-2.5 py-1.5 text-xs bg-accent/20 border border-border/80 rounded-lg text-center focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Long</label>
            <input
              type="number"
              value={longLength}
              onChange={(e) => handleLengthChange(focusLength, shortLength, parseInt(e.target.value) || 15)}
              className="w-full px-2.5 py-1.5 text-xs bg-accent/20 border border-border/80 rounded-lg text-center focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Manual Study Log modal dialog */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground transition"
            >
              <RotateCcw className="w-4 h-4 rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Manual Learning session</h3>
              <p className="text-xs text-muted-foreground">Log study duration intervals manually to update analytics.</p>
            </div>

            <form onSubmit={handleManualLog} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block font-mono">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={logDuration}
                  onChange={(e) => setLogDuration(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block font-mono">Session Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none"
                >
                  <option value="study">Study</option>
                  <option value="review">Review / Revision</option>
                  <option value="quiz">Interactive Quiz</option>
                  <option value="practice">Practical Coding</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block font-mono">Notes / Comments</label>
                <textarea
                  placeholder="e.g. Practiced recursive queries and completed tree depth exercises..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border/80 rounded-xl focus:outline-none h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={logSessionMutation.isPending}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition duration-200"
              >
                {logSessionMutation.isPending ? 'Logging...' : 'Log Study Session'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
