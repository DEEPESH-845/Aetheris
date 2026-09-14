import { z } from "zod";

export const POSTURES = [
  { id: "critical", label: "Critical", hint: "Isolate on first signal. Expect false positives." },
  { id: "severe", label: "Severe", hint: "Redirect on correlation, isolate on confirmation." },
  { id: "elevated", label: "Elevated", hint: "Redirect after enrichment; no automatic isolation." },
  { id: "guarded", label: "Guarded", hint: "Observe and profile; act only on critical severity." },
  { id: "standard", label: "Standard", hint: "Baseline monitoring with deception armed." },
] as const;

export const SENSORS = [
  { id: "dpi", label: "Deep packet inspection" },
  { id: "intel", label: "Correlate external threat intel feeds" },
  { id: "insider", label: "Monitor insider threat vectors" },
  { id: "cloud", label: "Real-time cloud asset discovery" },
] as const;

export const orgSettingsSchema = z.object({
  posture: z.enum(["critical", "severe", "elevated", "guarded", "standard"]).default("standard"),
  aggressiveness: z.number().int().min(0).max(100).default(80),
  autonomous: z.boolean().default(true),
  sensors: z.object({ dpi: z.boolean(), intel: z.boolean(), insider: z.boolean(), cloud: z.boolean() })
    .default({ dpi: true, intel: true, insider: true, cloud: true }),
});

export type OrgSettings = z.infer<typeof orgSettingsSchema>;

/** Tolerant read: unknown or partial JSON in Organization.settings falls back to defaults. */
export function parseOrgSettings(raw: unknown): OrgSettings {
  const r = orgSettingsSchema.safeParse(raw ?? {});
  return r.success ? r.data : orgSettingsSchema.parse({});
}
