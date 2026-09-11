const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const num = new Intl.NumberFormat("en-US");
const rel = new Intl.RelativeTimeFormat("en", { numeric: "always", style: "narrow" });

export function formatTime(ts: number) {
  return time.format(new Date(ts));
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions) {
  return opts ? new Intl.NumberFormat("en-US", opts).format(n) : num.format(n);
}

export function formatRelative(ts: number, now = Date.now()) {
  const s = Math.round((ts - now) / 1000);
  if (Math.abs(s) < 60) return rel.format(s, "second");
  if (Math.abs(s) < 3600) return rel.format(Math.round(s / 60), "minute");
  return rel.format(Math.round(s / 3600), "hour");
}

export function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
