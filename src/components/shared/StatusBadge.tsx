import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const severityVariant: Record<Severity, "danger-solid" | "danger" | "accent" | "default"> = {
  CRITICAL: "danger-solid",
  HIGH: "danger",
  MEDIUM: "accent",
  LOW: "default",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <Badge variant={severityVariant[severity]} className={cn("capitalize", className)}>
      {severity.toLowerCase()}
    </Badge>
  );
}

export type StateTone = "neutral" | "accent" | "danger" | "success";

const toneVariant: Record<StateTone, "default" | "accent" | "danger" | "success"> = {
  neutral: "default",
  accent: "accent",
  danger: "danger",
  success: "success",
};

const dotColor: Record<StateTone, string> = {
  neutral: "bg-ink-subtle",
  accent: "bg-accent",
  danger: "bg-danger",
  success: "bg-success",
};

interface StatusBadgeProps {
  label: string;
  tone?: StateTone;
  /** Only for genuinely live state (a running process, an open session). One per component. */
  live?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone = "neutral", live = false, className }: StatusBadgeProps) {
  return (
    <Badge variant={toneVariant[tone]} className={cn("capitalize", className)}>
      {live && (
        <span aria-hidden="true" className={cn("size-1.5 rounded-full animate-pulse", dotColor[tone])} />
      )}
      {label.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}
