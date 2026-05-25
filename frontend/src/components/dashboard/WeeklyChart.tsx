'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface WeeklyData {
  _id: string; // "YYYY-MM-DD"
  totalDuration: number;
  sessionCount: number;
  pomodoroCount: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
}

export default function WeeklyChart({ data = [] }: WeeklyChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-accent/20 animate-pulse rounded-2xl"></div>;
  }

  // Format data for chart
  const chartData = data.map((item) => {
    const dateObj = new Date(item._id);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      minutes: Math.round(item.totalDuration / 60),
      sessions: item.sessionCount,
      pomodoros: item.pomodoroCount,
    };
  });

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Weekly Progress</h4>
        <p className="text-xs text-muted-foreground">Study minutes by day</p>
      </div>

      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
            No study sessions logged this week. Start a Pomodoro!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-stroke)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-stroke)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Area type="monotone" dataKey="minutes" name="Minutes" stroke="var(--chart-stroke)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMins)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
