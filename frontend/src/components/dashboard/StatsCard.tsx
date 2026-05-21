import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'violet' | 'amber' | 'emerald' | 'rose' | 'blue';
}

const VARIANTS = {
  violet: {
    border:   'border-l-4 border-l-violet-500',
    iconBg:   'bg-violet-500/15 dark:bg-violet-500/20',
    iconText: 'text-violet-600 dark:text-violet-400',
    ring:     'ring-1 ring-violet-500/20',
    glow:     'hover:shadow-violet-500/10',
  },
  amber: {
    border:   'border-l-4 border-l-amber-500',
    iconBg:   'bg-amber-500/15 dark:bg-amber-500/20',
    iconText: 'text-amber-600 dark:text-amber-400',
    ring:     'ring-1 ring-amber-500/20',
    glow:     'hover:shadow-amber-500/10',
  },
  emerald: {
    border:   'border-l-4 border-l-emerald-500',
    iconBg:   'bg-emerald-500/15 dark:bg-emerald-500/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    ring:     'ring-1 ring-emerald-500/20',
    glow:     'hover:shadow-emerald-500/10',
  },
  rose: {
    border:   'border-l-4 border-l-rose-500',
    iconBg:   'bg-rose-500/15 dark:bg-rose-500/20',
    iconText: 'text-rose-600 dark:text-rose-400',
    ring:     'ring-1 ring-rose-500/20',
    glow:     'hover:shadow-rose-500/10',
  },
  blue: {
    border:   'border-l-4 border-l-blue-500',
    iconBg:   'bg-blue-500/15 dark:bg-blue-500/20',
    iconText: 'text-blue-600 dark:text-blue-400',
    ring:     'ring-1 ring-blue-500/20',
    glow:     'hover:shadow-blue-500/10',
  },
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'violet',
}: StatsCardProps) {
  const v = VARIANTS[variant];

  return (
    <div className={[
      'glass-card rounded-2xl p-5 flex items-start justify-between gap-4',
      'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
      v.border, v.ring, v.glow,
    ].join(' ')}>
      <div className="space-y-1.5 min-w-0">
        <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-widest truncate">
          {title}
        </p>
        <p className="text-[26px] font-extrabold tracking-tight text-foreground leading-none">
          {value}
        </p>
        <p className="text-[11.5px] text-muted-foreground font-medium leading-snug">
          {description}
        </p>
      </div>

      <div className={`p-3 rounded-xl shrink-0 ${v.iconBg}`}>
        <Icon className={`w-5 h-5 ${v.iconText}`} />
      </div>
    </div>
  );
}
