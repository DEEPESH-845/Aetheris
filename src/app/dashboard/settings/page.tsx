"use client";

import { useId, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const POSTURES = [
  { id: "critical", label: "Critical", hint: "Isolate on first signal. Expect false positives." },
  { id: "severe", label: "Severe", hint: "Redirect on correlation, isolate on confirmation." },
  { id: "elevated", label: "Elevated", hint: "Redirect after enrichment; no automatic isolation." },
  { id: "guarded", label: "Guarded", hint: "Observe and profile; act only on critical severity." },
  { id: "standard", label: "Standard", hint: "Baseline monitoring with deception armed." },
];

const SENSORS = [
  { id: "dpi", label: "Deep packet inspection" },
  { id: "intel", label: "Correlate external threat intel feeds" },
  { id: "insider", label: "Monitor insider threat vectors" },
  { id: "cloud", label: "Real-time cloud asset discovery" },
];

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
  const [aggressiveness, setAggressiveness] = useState(80);
  const [autonomous, setAutonomous] = useState(true);
  const [posture, setPosture] = useState("standard");
  const [sensors, setSensors] = useState<Record<string, boolean>>(Object.fromEntries(SENSORS.map((s) => [s.id, true])));
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <PageHeader
        title="Configuration"
        description="How aggressively the engine acts, and which sensors feed it."
        actions={
          <div className="flex items-center gap-3">
            <span aria-live="polite" className="text-sm text-success">
              {saved ? "Saved" : ""}
            </span>
            <Button type="submit">Save configuration</Button>
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
                onValueChange={(v) => setAggressiveness(Array.isArray(v) ? v[0] : v)}
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
                onChange={setAutonomous}
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
                          onChange={() => setPosture(p.id)}
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
              <ToggleRow key={s.id} id={s.id} label={s.label} checked={sensors[s.id]} onChange={(v) => setSensors((prev) => ({ ...prev, [s.id]: v }))} />
            ))}
          </PanelBody>
        </Panel>
      </div>
    </form>
  );
}
