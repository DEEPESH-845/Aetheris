import { cn } from "@/lib/utils";

export type Tone = "default" | "accent" | "danger" | "success";

const toneText: Record<Tone, string> = {
  default: "text-ink",
  accent: "text-accent",
  danger: "text-danger",
  success: "text-success",
};

interface StatBlockProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: Tone;
  hint?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function StatBlock({ label, value, unit, tone = "default", hint, className, children }: StatBlockProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 p-4", className)}>
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={cn("font-mono text-2xl leading-none tabular-nums", toneText[tone])}>
        {value}
        {unit && <span className="ml-1 text-sm text-ink-subtle">{unit}</span>}
      </span>
      {hint && <span className="text-xs text-ink-subtle">{hint}</span>}
      {children && <div className="mt-2 h-12 min-w-0">{children}</div>}
    </div>
  );
}
