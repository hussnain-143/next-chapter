import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'primary' | 'gold' | 'success' | 'accent' | 'info';
}

const VARIANTS = {
  primary: {
    border: 'border-l-4 border-l-primary',
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    ring: 'ring-1 ring-primary/20',
  },
  gold: {
    border: 'border-l-4 border-l-gold',
    iconBg: 'bg-gold/15',
    iconText: 'text-gold',
    ring: 'ring-1 ring-gold/25',
  },
  success: {
    border: 'border-l-4 border-l-success',
    iconBg: 'bg-success/15',
    iconText: 'text-success',
    ring: 'ring-1 ring-success/20',
  },
  accent: {
    border: 'border-l-4 border-l-accent',
    iconBg: 'bg-accent/15',
    iconText: 'text-accent',
    ring: 'ring-1 ring-accent/20',
  },
  info: {
    border: 'border-l-4 border-l-info',
    iconBg: 'bg-info/15',
    iconText: 'text-info',
    ring: 'ring-1 ring-info/20',
  },
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'primary',
}: StatsCardProps) {
  const v = VARIANTS[variant];

  return (
    <div
      className={[
        'glass-card rounded-2xl p-5 flex items-start justify-between gap-4',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        v.border,
        v.ring,
      ].join(' ')}
    >
      <div className="space-y-1.5 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="text-[26px] font-extrabold tracking-tight text-foreground leading-none tabular-nums">
          {value}
        </p>
        <p className="text-sm text-muted-foreground font-medium leading-snug">{description}</p>
      </div>

      <div className={`p-3 rounded-xl shrink-0 ${v.iconBg}`}>
        <Icon className={`w-5 h-5 ${v.iconText}`} />
      </div>
    </div>
  );
}
