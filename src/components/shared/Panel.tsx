import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("flex min-h-0 flex-col rounded-panel border bg-surface", className)}
      {...props}
    />
  );
}

interface PanelHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ title, description, actions, className }: PanelHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-h-11 shrink-0 items-center justify-between gap-3 border-b px-4 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium text-ink">{title}</h2>
        {description && <p className="truncate text-xs text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

interface PanelBodyProps extends React.ComponentProps<"div"> {
  padded?: boolean;
  scroll?: boolean;
}

export function PanelBody({ className, padded = true, scroll = false, ...props }: PanelBodyProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1",
        padded && "p-4",
        scroll && "overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}
