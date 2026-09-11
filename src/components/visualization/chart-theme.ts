import { useSyncExternalStore } from "react";

export interface ChartColors {
  accent: string;
  danger: string;
  muted: string;
  subtle: string;
  surface: string;
  border: string;
}

const fallback: ChartColors = {
  accent: "#e9b44c",
  danger: "#e0524a",
  muted: "#9aa0a8",
  subtle: "#7d838b",
  surface: "#1a1e24",
  border: "rgba(255,255,255,0.14)",
};

let cached: ChartColors | null = null;

function readColors(): ChartColors {
  if (cached) return cached;
  const css = getComputedStyle(document.documentElement);
  const read = (name: string, fb: string) => css.getPropertyValue(name).trim() || fb;
  cached = {
    accent: read("--color-accent", fallback.accent),
    danger: read("--color-danger", fallback.danger),
    muted: read("--color-ink-muted", fallback.muted),
    subtle: read("--color-ink-subtle", fallback.subtle),
    surface: read("--color-surface-2", fallback.surface),
    border: read("--color-border-strong", fallback.border),
  };
  return cached;
}

const noop = () => () => {};

/** Reads the token layer once so recharts (which needs concrete colors) matches the CSS. */
export function useChartColors(): ChartColors {
  return useSyncExternalStore(noop, readColors, () => fallback);
}

export function tooltipStyle(c: ChartColors) {
  return {
    contentStyle: {
      backgroundColor: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 6,
      fontSize: 12,
      fontFamily: "var(--font-geist-mono)",
      padding: "6px 8px",
    },
    itemStyle: { color: "var(--color-ink)" },
    labelStyle: { display: "none" as const },
  };
}
