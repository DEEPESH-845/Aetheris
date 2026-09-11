import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { SeverityBadge, type Severity } from "@/components/shared/StatusBadge";

export const metadata: Metadata = {
  title: "Sandbox",
  description: "Six attack vectors you can fire at the Aetheris engine and watch the deception handoff in real time.",
};

const VECTORS: { name: string; severity: Severity; body: string }[] = [
  { name: "APT: Cobalt Strike", severity: "CRITICAL", body: "A beacon establishing command and control over HTTPS, modeled on APT28 tradecraft." },
  { name: "Ransomware outbreak", severity: "CRITICAL", body: "Encrypts network shares and attempts exfiltration to a Tor exit node." },
  { name: "SQL injection and exfil", severity: "HIGH", body: "Blind SQLi against the API gateway followed by a bulk data pull." },
  { name: "SSH brute force", severity: "HIGH", body: "Distributed credential stuffing from a dozen source addresses." },
  { name: "Insider lateral pivot", severity: "HIGH", body: "A compromised internal endpoint pivoting over RDP toward production." },
  { name: "Layer 7 DDoS", severity: "MEDIUM", body: "HTTP flood on the auth endpoint to test ingress rerouting under load." },
];

export default function SandboxMarketingPage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-6 pt-20 pb-16">
        <div className="max-w-[60ch]">
          <h1 className="text-display text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
            Test the engine against real attack patterns
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-muted">
            Fire a vector, then watch the kill chain get intercepted, redirected into a twin, and mined for indicators.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link href="/dashboard/sandbox" />}>
              Open the sandbox lab
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(4rem,8vw,7rem)]">
          <h2 className="text-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink">
            Attack vectors
          </h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {VECTORS.map((v) => (
              <li key={v.name} className="flex flex-col gap-2 border-t py-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium text-ink">{v.name}</h3>
                  <SeverityBadge severity={v.severity} />
                </div>
                <p className="max-w-[55ch] text-base text-ink-muted">{v.body}</p>
                <Link href="/dashboard/sandbox" className="mt-1 w-fit text-sm text-accent underline-offset-4 hover:underline">
                  Open in sandbox lab
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
