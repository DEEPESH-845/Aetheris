import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SandboxCta() {
  return (
    <section className="border-t">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-6 py-[clamp(4rem,8vw,6rem)] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink">
            Run a live-fire drill against the engine
          </h2>
          <p className="mt-3 max-w-[52ch] text-base text-ink-muted">
            Six attack vectors, one click each. Watch the redirect, the twin, and the extracted IOCs in real time.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button size="lg" render={<Link href="/dashboard/sandbox" />}>
            Open the sandbox lab
          </Button>
          <Button size="lg" variant="ghost" render={<Link href="/sandbox" />}>
            See attack vectors
          </Button>
        </div>
      </div>
    </section>
  );
}
