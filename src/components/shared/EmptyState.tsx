import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: IconComponent, title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-3 p-8 text-center", className)}>
      <span className="flex size-10 items-center justify-center rounded-control bg-surface-2 text-ink-muted">
        <IconComponent size={20} weight="duotone" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {hint && <p className="max-w-xs text-sm text-ink-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
