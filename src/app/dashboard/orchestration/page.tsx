"use client";

import { Cube, ShieldCheck } from "@phosphor-icons/react";
import { useSimulationStore, type SandboxTwin, type TwinLifecycle, type TerraformOperation } from "@/store/useSimulationStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody, PanelHeader } from "@/components/shared/Panel";
import { StatBlock } from "@/components/shared/StatBlock";
import { StatusBadge, type StateTone } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeedList } from "@/components/shared/FeedList";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDuration } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const lifecycle: Record<TwinLifecycle, { tone: StateTone; live: boolean }> = {
  CLONING: { tone: "accent", live: true },
  PROVISIONING: { tone: "accent", live: true },
  HARDENING: { tone: "accent", live: true },
  ONLINE: { tone: "success", live: false },
  COMBAT: { tone: "accent", live: true },
  TEARDOWN: { tone: "neutral", live: false },
};

function LifecycleBadge({ state }: { state: TwinLifecycle }) {
  return <StatusBadge label={state} tone={lifecycle[state].tone} live={lifecycle[state].live} />;
}

function TwinCard({ twin }: { twin: SandboxTwin }) {
  const now = useNow();
  return (
    <Panel className="animate-in fade-in duration-200">
      <PanelHeader title={twin.id} description={`${twin.vmName} on ${twin.vmNode}`} actions={<LifecycleBadge state={twin.lifecycle} />} />
      <dl className="grid grid-cols-4 divide-x border-b text-xs">
        {[
          ["vCPU", twin.vCpus],
          ["RAM", `${twin.ramGb}\u00a0GB`],
          ["Disk", `${twin.diskGb}\u00a0GB`],
          ["IP", twin.ipAddress],
        ].map(([k, v]) => (
          <div key={String(k)} className="px-3 py-2">
            <dt className="text-ink-subtle">{k}</dt>
            <dd className="font-mono text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {twin.lifecycle === "COMBAT" && (
        <div className="grid grid-cols-3 divide-x border-b">
          <StatBlock label="Credential hits" value={twin.credentialHits} tone="danger" className="p-3" />
          <StatBlock label="Exfil attempts" value={twin.exfilAttempts} tone="accent" className="p-3" />
          <StatBlock label="IOCs" value={twin.iocsCaptured.length} className="p-3" />
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2 text-xs">
        <span className="text-ink-subtle">
          Attacker <span className="font-mono text-danger">{twin.attackerIp}</span>
        </span>
        <span className="font-mono text-ink-muted">{formatDuration(Math.max(0, now - twin.spawnedAt))}</span>
      </div>
    </Panel>
  );
}

function opTone(op: TerraformOperation) {
  if (op.status === "error" || op.step.includes("error")) return "text-danger";
  if (op.step.includes("complete") || op.step.includes("DECEPTION")) return "text-success";
  if (op.step.includes("TASK")) return "text-accent";
  return "text-ink-muted";
}

export default function OrchestrationPage() {
  const sandboxEnvironments = useSimulationStore((s) => s.sandboxEnvironments);
  const sandboxTwins = useSimulationStore((s) => s.sandboxTwins);
  const initSandboxEnvironment = useSimulationStore((s) => s.initSandboxEnvironment);
  const spawnSandboxTwin = useSimulationStore((s) => s.spawnSandboxTwin);
  const addTerraformOp = useSimulationStore((s) => s.addTerraformOp);
  const updateTwinLifecycle = useSimulationStore((s) => s.updateTwinLifecycle);

  const twins = Object.values(sandboxTwins);
  const activeTwin = twins.find((t) => ["COMBAT", "ONLINE", "HARDENING", "PROVISIONING", "CLONING"].includes(t.lifecycle));
  const ebpfLogs = Object.values(sandboxEnvironments).flatMap((e) => e.ebpfLogs).slice(0, 20);

  const handleProvision = () => {
    const twinId = `TWIN-${Math.floor(Math.random() * 9000) + 1000}`;
    initSandboxEnvironment(`ENV-${twinId}`);
    spawnSandboxTwin({
      id: twinId,
      threatId: `SIM-${Math.floor(Math.random() * 90000) + 10000}`,
      attackerIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.12.5`,
      lifecycle: "PROVISIONING",
      vmName: `honey-prod-${twinId.toLowerCase()}`,
      vmNode: "pve-02",
      vCpus: 4,
      ramGb: 16,
      diskGb: 50,
      ipAddress: "10.0.9.155",
      spawnedAt: Date.now(),
      terraformOps: [],
      attackerSessions: [],
      exfilAttempts: 0,
      credentialHits: 0,
      iocsCaptured: [],
    });
    setTimeout(() => {
      addTerraformOp(twinId, { id: `op-1-${Date.now()}`, ts: Date.now(), step: "proxmox_vm_qemu.honey-db: Creating...", status: "running" });
      setTimeout(() => {
        addTerraformOp(twinId, { id: `op-2-${Date.now()}`, ts: Date.now(), step: "proxmox_vm_qemu.honey-db: Creation complete", status: "complete", duration: 1200 });
        updateTwinLifecycle(twinId, "HARDENING");
        setTimeout(() => {
          addTerraformOp(twinId, { id: `op-3-${Date.now()}`, ts: Date.now(), step: "ansible_playbook.harden_nginx: TASK [Apply Zero Trust config]", status: "complete" });
          updateTwinLifecycle(twinId, "ONLINE");
        }, 1500);
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full">
      <PageHeader
        title="Orchestration"
        description="Proxmox cloning, Terraform and Ansible runs, and the eBPF sensors on each twin."
        actions={
          <Button onClick={handleProvision}>
            <Cube aria-hidden="true" />
            Provision twin
          </Button>
        }
      />

      {twins.length > 0 && (
        <div className="grid shrink-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {twins.map((twin) => (
            <TwinCard key={twin.id} twin={twin} />
          ))}
        </div>
      )}

      {activeTwin ? (
        <div className="grid min-h-0 gap-4 lg:flex-1 lg:grid-cols-2">
          <Panel className="min-h-[280px]">
            <PanelHeader title="Terraform and Ansible" actions={<LifecycleBadge state={activeTwin.lifecycle} />} />
            <PanelBody padded={false}>
              <FeedList
                items={activeTwin.terraformOps}
                getKey={(op) => op.id}
                className="px-4 py-3"
                render={(op) => (
                  <div className="flex items-start gap-3 py-0.5">
                    <span className={cn("min-w-0 break-words", opTone(op))}>{op.step}</span>
                    {op.status === "running" && <span aria-label="Running" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent animate-pulse" />}
                  </div>
                )}
                emptyState={<p className="p-4 text-xs text-ink-subtle">Initializing Terraform state…</p>}
              />
            </PanelBody>
          </Panel>

          <Panel className="min-h-[280px]">
            <PanelHeader
              title="Cilium eBPF sensors"
              actions={activeTwin.lifecycle === "COMBAT" ? <StatusBadge label="Deception active" tone="accent" live /> : undefined}
            />
            <PanelBody padded={false} scroll>
              {activeTwin.lifecycle === "PROVISIONING" || activeTwin.lifecycle === "CLONING" ? (
                <EmptyState icon={ShieldCheck} title="Waiting for kernel probes" hint="Sensors attach once the twin finishes provisioning." />
              ) : ebpfLogs.length === 0 ? (
                <EmptyState icon={ShieldCheck} title="No syscalls captured yet" />
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-surface">
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Syscall</TableHead>
                      <TableHead>PID</TableHead>
                      <TableHead className="text-right">Verdict</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono text-xs">
                    {ebpfLogs.map((log, i) => (
                      <TableRow key={`${log.timestamp}-${i}`}>
                        <TableCell className="text-ink">{log.pod ?? activeTwin.vmName}</TableCell>
                        <TableCell className="text-accent">{log.syscall}</TableCell>
                        <TableCell className="text-ink-muted">{log.pid}</TableCell>
                        <TableCell className={cn("text-right", log.verdict === "FORWARDED" ? "text-success" : "text-danger")}>
                          {log.verdict}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </PanelBody>
          </Panel>
        </div>
      ) : (
        <Panel className="flex-1">
          <EmptyState
            icon={Cube}
            title="No sandbox twins"
            hint="Twins are provisioned automatically when a threat enters mitigation. Fire a vector in the Sandbox Lab, or provision one by hand."
            action={<Button variant="secondary" onClick={handleProvision}>Provision twin</Button>}
          />
        </Panel>
      )}
    </div>
  );
}
