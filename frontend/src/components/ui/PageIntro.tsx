import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  hint?: string;
}

export function PageIntro({ title, description, icon: Icon, action, hint }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
        {hint && (
          <p className="text-sm text-muted-foreground/90 flex items-start gap-2 pt-1">
            {Icon && <Icon className="w-4 h-4 shrink-0 mt-0.5 text-primary/80" aria-hidden />}
            <span>{hint}</span>
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
