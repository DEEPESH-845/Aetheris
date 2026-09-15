import { siKubernetes, siCilium, siApachekafka, siClickhouse, siTerraform, siProxmox, siAnsible, siLanggraph } from "simple-icons";

const LOGOS = [siKubernetes, siCilium, siApachekafka, siClickhouse, siTerraform, siProxmox, siAnsible, siLanggraph];

export function StackLogos() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y bg-surface/60">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <p className="mb-6 text-center text-sm text-ink-muted">Runs on the infrastructure you already have</p>
        <div
          className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          aria-label="Target infrastructure (planned integrations)"
          role="list"
        >
          <div className="flex w-max gap-14 motion-safe:animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
            {row.map((icon, i) => (
              <div
                key={`${icon.slug}-${i}`}
                role={i < LOGOS.length ? "listitem" : undefined}
                aria-hidden={i >= LOGOS.length || undefined}
                className="flex items-center gap-2.5 text-ink-muted"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
                <span className="text-sm font-medium">{icon.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
