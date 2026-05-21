import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  colorClass?: string;
}

export default function StatsCard({ title, value, description, icon: Icon, colorClass = "from-primary/10 to-primary/10 text-primary border-primary/20" }: StatsCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 flex items-start justify-between transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
        <p className="text-xs text-muted-foreground font-medium">{description}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-tr border ${colorClass} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
