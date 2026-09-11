"use client";

import { Detective } from "@phosphor-icons/react";
import { useSimulationStore, type AttackerProfile } from "@/store/useSimulationStore";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

function confidenceTone(c: number) {
  return c >= 90 ? "text-danger" : c >= 75 ? "text-accent" : "text-ink-muted";
}

function ProfileRow({ profile }: { profile: AttackerProfile }) {
  const observed = profile.ttps.filter((t) => t.observed).slice(0, 4);
  return (
    <li className="flex flex-col gap-3 px-4 py-4 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-ink">{profile.actorName ?? "Unattributed actor"}</span>
            <Badge variant="outline" className="font-mono">{profile.countryCode}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{profile.asnName}</p>
        </div>
        <div className="text-right">
          <div className={cn("font-mono text-lg leading-none tabular-nums", confidenceTone(profile.confidence))}>
            {profile.confidence}%
          </div>
          <div className="text-xs text-ink-subtle">attribution</div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div><dt className="text-ink-subtle">Source IP</dt><dd className="font-mono text-ink">{profile.sourceIp}</dd></div>
        <div><dt className="text-ink-subtle">Kill chain stage</dt><dd className="text-accent">{profile.killChainStage}</dd></div>
        <div><dt className="text-ink-subtle">First seen</dt><dd className="font-mono text-ink-muted">{formatRelative(profile.firstSeen)}</dd></div>
        <div><dt className="text-ink-subtle">Last seen</dt><dd className="font-mono text-ink-muted">{formatRelative(profile.lastSeen)}</dd></div>
      </dl>

      {profile.tooling.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Identified tooling">
          {profile.tooling.map((tool) => (
            <Badge key={tool} variant="danger">{tool}</Badge>
          ))}
        </div>
      )}

      {observed.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs">
          {observed.map((ttp) => (
            <li key={ttp.technique} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2">
              <span className="font-mono text-accent">{ttp.technique}</span>
              <span className="truncate text-ink-muted">{ttp.name}</span>
              <span className="font-mono tabular-nums text-ink-subtle">{ttp.confidence}%</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function AttackerProfilePanel() {
  const attackerProfiles = useSimulationStore((s) => s.attackerProfiles);
  const profiles = Object.values(attackerProfiles);

  if (profiles.length === 0) {
    return <EmptyState icon={Detective} title="No attacker profiles yet" hint="Profiles build up as the model attributes live threats." />;
  }

  return <ul className="divide-y">{profiles.map((p) => <ProfileRow key={p.id} profile={p} />)}</ul>;
}
