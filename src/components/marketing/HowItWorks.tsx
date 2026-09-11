const STEPS = [
  {
    title: "Detect",
    body: "Zeek, Suricata, and eBPF probes stream into Kafka. The AI core correlates the signal against MITRE ATT&CK in under a second.",
  },
  {
    title: "Redirect",
    body: "Cilium rewrites the socket in the kernel. The attacker's live session moves to a twin without dropping the TCP handshake.",
  },
  {
    title: "Deceive",
    body: "Terraform and Ansible stand up a Proxmox twin of the targeted host, seeded with believable data and planted credentials.",
  },
  {
    title: "Extract",
    body: "Every command, payload, and exfil attempt is recorded. IOCs and TTPs land in the profile before the attacker notices.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto grid max-w-[1200px] gap-10 px-6 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink">
            How a breach becomes intelligence
          </h2>
          <p className="mt-4 max-w-[46ch] text-base text-ink-muted">
            Four stages, each automated. An operator can watch every one of them from the command center.
          </p>
        </div>
      </div>
      <ol className="lg:col-span-7">
        {STEPS.map((step, i) => (
          <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t py-8 last:border-b">
            <span className="font-mono text-sm text-ink-subtle">0{i + 1}</span>
            <div>
              <h3 className="text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 max-w-[60ch] text-base text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
