import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How Aetheris moves an attacker from production into a sandboxed twin: telemetry, AI core, and the deception plane.",
};

const PLANES = [
  { name: "Production", parts: ["Ingress", "Kubernetes pods", "Cilium eBPF hooks"] },
  { name: "Telemetry", parts: ["Apache Kafka", "ClickHouse"] },
  { name: "AI core", parts: ["FastAPI gateway", "LangGraph", "vLLM", "Qdrant"] },
  { name: "Deception", parts: ["Celery workers", "Ansible", "Proxmox VE"] },
];

const CAPABILITIES = [
  { term: "Kernel-level redirection", detail: "Cilium rewrites socket routing inside the kernel, so the attacker's session moves to the twin without a dropped handshake." },
  { term: "Vector memory", detail: "Qdrant holds historical threat context. Retrieval runs in the enrichment step, before the model decides." },
  { term: "Zero-trust mesh", detail: "Every node is authenticated and verified continuously. Isolation is a policy change, not a cable pull." },
  { term: "Event-driven pipeline", detail: "Kafka carries telemetry from probe to model. ClickHouse keeps the full history queryable." },
  { term: "Deterministic reasoning", detail: "LangGraph fixes the order of ingest, enrich, correlate, decide, execute. Every decision is logged with its inputs." },
  { term: "Machine-speed remediation", detail: "The model emits Ansible playbooks and gRPC calls. Containment lands before a human reads the alert." },
];

export default function ArchitecturePage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <div className="max-w-[60ch]">
          <h1 className="text-display text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
            Target architecture
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-muted">
            The design Aetheris is built toward: kernel telemetry feeding a reasoning core that provisions deception at the edge. The current release simulates these planes so the operator workflow can be evaluated before sensors ship.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link href="/dashboard" />}>
              Open dashboard
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(4rem,8vw,7rem)]" aria-labelledby="planes">
        <h2 id="planes" className="sr-only">Platform planes</h2>
        <ol className="grid gap-px overflow-hidden rounded-panel border bg-border md:grid-cols-4">
          {PLANES.map((plane, i) => (
            <li key={plane.name} className="relative flex flex-col gap-4 bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{plane.name}</span>
                {i < PLANES.length - 1 && (
                  <CaretRight size={14} className="hidden text-ink-subtle md:block" aria-hidden="true" />
                )}
              </div>
              <ul className="flex flex-col gap-1.5 font-mono text-sm text-ink-muted">
                {plane.parts.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t bg-surface/40">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(4rem,8vw,7rem)]">
          <h2 className="text-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink">
            What the platform guarantees
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div key={c.term} className="border-t pt-5">
                <dt className="text-base font-medium text-ink">{c.term}</dt>
                <dd className="mt-2 max-w-[55ch] text-base text-ink-muted">{c.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
