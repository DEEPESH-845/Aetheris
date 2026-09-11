import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  wordmark?: boolean;
  className?: string;
}

/** Aetheris mark: a shield outline with a single lure point. One path, currentColor. */
export function BrandMark({ size = 20, wordmark = true, className }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 2.5 4.5 5.6v6.2c0 4.6 3.2 8.4 7.5 9.7 4.3-1.3 7.5-5.1 7.5-9.7V5.6L12 2.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.2" className="fill-accent" />
      </svg>
      {wordmark && <span className="text-sm font-medium tracking-tight">Aetheris</span>}
    </span>
  );
}
