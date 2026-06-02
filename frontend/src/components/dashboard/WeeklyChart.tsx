'use client';

import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { lastNDays, toLocalDateKey } from '../../lib/dateUtils';

interface WeeklyData {
  _id: string;
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

  const chartData = useMemo(() => {
    return lastNDays(7).map((date) => {
      const key = toLocalDateKey(date);
      const item = data.find((d) => d._id === key);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: item ? Math.round(item.totalDuration / 60) : 0,
        sessions: item?.sessionCount ?? 0,
        pomodoros: item?.pomodoroCount ?? 0,
      };
    });
  }, [data]);

  const hasActivity = chartData.some((d) => d.minutes > 0);

  if (!mounted) {
    return <div className="h-64 w-full bg-accent/20 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Weekly Progress</h4>
        <p className="text-xs text-muted-foreground">Study minutes by day</p>
      </div>

      <div className="h-64 w-full">
        {!hasActivity ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <p className="text-xs text-muted-foreground italic">
              No study activity this week yet.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Complete a lesson or use the Pomodoro timer — both count toward this chart.
            </p>
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
                }}
                formatter={(value) => [`${value ?? 0} min`, 'Study time']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                name="Minutes"
                stroke="var(--chart-stroke)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMins)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
