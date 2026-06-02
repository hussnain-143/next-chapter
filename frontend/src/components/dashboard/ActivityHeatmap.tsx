'use client';

import { toLocalDateKey } from '../../lib/dateUtils';

interface HeatmapData {
  _id: string;
  totalDuration: number;
  sessionCount: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

export default function ActivityHeatmap({ data = [] }: ActivityHeatmapProps) {
  const getDaysArray = () => {
    const days = [];
    const date = new Date();
    date.setDate(date.getDate() - 83);

    for (let i = 0; i < 84; i++) {
      const dateString = toLocalDateKey(date);
      const match = data.find((d) => d._id === dateString);
      days.push({
        date: dateString,
        intensity: match ? Math.min(4, Math.ceil(match.totalDuration / 1800)) : 0,
        duration: match ? Math.round(match.totalDuration / 60) : 0,
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysArray();
  const hasActivity = days.some((d) => d.duration > 0);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-muted/40 hover:bg-muted/60';
      case 1:
        return 'bg-primary/20 hover:bg-primary/35';
      case 2:
        return 'bg-primary/40 hover:bg-primary/55';
      case 3:
        return 'bg-primary/60 hover:bg-primary/75';
      case 4:
        return 'bg-primary hover:bg-primary shadow-sm shadow-primary/20';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Learning Consistency</h4>
          <p className="text-xs text-muted-foreground">Log of your daily study minutes</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono shrink-0">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-muted/40 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-primary/20 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-primary/40 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-primary/60 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
          <span>More</span>
        </div>
      </div>

      {!hasActivity ? (
        <p className="text-xs text-muted-foreground italic py-6 text-center">
          No study activity yet. Complete a lesson or run a Pomodoro to fill this map.
        </p>
      ) : (
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-full overflow-x-auto py-1">
          {days.map((day) => (
            <div
              key={day.date}
              className={`w-3 h-3 rounded-sm transition-all duration-300 ${getIntensityColor(day.intensity)} cursor-pointer relative group`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-card text-foreground text-[10px] py-1 px-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none border border-border">
                <span className="font-semibold">{day.duration} mins</span> on {day.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
