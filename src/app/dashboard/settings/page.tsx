"use client";

import { useEffect, useId, useState } from "react";
import { api } from "@/utils/trpc";
import { useSimulationStore } from "@/store/useSimulationStore";
import { POSTURES, SENSORS, type OrgSettings } from "@/lib/org-settings";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <Label htmlFor={id} className="flex flex-col items-start gap-0.5">
        <span className="text-sm text-ink">{label}</span>
        {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
      </Label>
      <Switch id={id} name={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const sliderId = useId();
  const settings = api.org.getSettings.useQuery();
  const [draft, setDraft] = useState<OrgSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const utils = api.useUtils();
  const update = api.org.updateSettings.useMutation({
    onSuccess: (data) => {
      utils.org.getSettings.setData(undefined, data);
      useSimulationStore.getState().setAutonomous(data.autonomous);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  useEffect(() => {
    if (settings.data && !draft) setDraft(settings.data);
  }, [settings.data, draft]);

  if (!draft) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Configuration" description="How aggressively the engine acts, and which sensors feed it." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  const { aggressiveness, autonomous, posture, sensors } = draft;
  const patch = (p: Partial<OrgSettings>) => setDraft((d) => (d ? { ...d, ...p } : d));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate(draft);
      }}
    >
      <PageHeader
        title="Configuration"
        description="How aggressively the engine acts, and which sensors feed it."
        actions={
          <div className="flex items-center gap-3">
            <span aria-live="polite" className={cn("text-sm", update.error ? "text-danger" : "text-success")}>
              {update.error ? update.error.message : saved ? "Saved" : ""}
            </span>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving" : "Save configuration"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Heuristics engine" />
          <PanelBody className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={sliderId}>Response aggressiveness</Label>
                <span className="font-mono text-sm tabular-nums text-ink">{aggressiveness}%</span>
              </div>
              <Slider
                id={sliderId}
                name="aggressiveness"
                min={0}
                max={100}
                value={aggressiveness}
                onValueChange={(v) => patch({ aggressiveness: Array.isArray(v) ? v[0] : v })}
                aria-label="Response aggressiveness"
              />
              <p className="text-xs text-ink-muted">Higher values cut response latency at the cost of more false positives.</p>
            </div>
            <div className="border-t">
              <ToggleRow
                id="autonomous"
                label="Autonomous mitigation"
                hint="Execute countermeasures without human approval."
                checked={autonomous}
                onChange={(v) => patch({ autonomous: v })}
              />
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Defense posture" />
          <PanelBody padded={false}>
            <fieldset>
              <legend className="sr-only">Defense posture</legend>
              <ul className="divide-y">
                {POSTURES.map((p) => {
                  const selected = posture === p.id;
                  return (
                    <li key={p.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 px-4 py-3 transition-[background-color] hover:bg-surface-2",
                          selected && "bg-accent-soft/60",
                        )}
                      >
                        <input
                          type="radio"
                          name="posture"
                          value={p.id}
                          checked={selected}
                          onChange={() => patch({ posture: p.id })}
                          className="mt-1 size-3.5 accent-accent"
                        />
                        <span className="flex flex-col">
                          <span className={cn("text-sm", selected ? "text-ink" : "text-ink-muted")}>{p.label}</span>
                          <span className="text-xs text-ink-subtle">{p.hint}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Telemetry sensors" />
          <PanelBody className="divide-y py-1">
            {SENSORS.map((s) => (
              <ToggleRow key={s.id} id={s.id} label={s.label} checked={sensors[s.id]} onChange={(v) => patch({ sensors: { ...sensors, [s.id]: v } })} />
            ))}
          </PanelBody>
        </Panel>
      </div>
    </form>
  );
}
