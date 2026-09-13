"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export interface LabelSpec {
  id: string;
  position: THREE.Vector3;
  title: string;
  detail: string;
  /** Which side of the anchor the text extends to. */
  side?: "right" | "left";
  /** Returns opacity 0..1 for the current scene state. */
  opacity: () => number;
}

/**
 * Mono annotations anchored to the objects they name. The scene must read
 * without the copy column: this is production, this is the twin, this is
 * the profile being assembled.
 */
export function SceneLabels({ labels }: { labels: LabelSpec[] }) {
  return (
    <>
      {labels.map((l) => (
        <Label key={l.id} spec={l} />
      ))}
    </>
  );
}

function Label({ spec }: { spec: LabelSpec }) {
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const node = el.current;
    if (!node) return;
    const o = spec.opacity();
    node.style.opacity = o.toFixed(3);
    node.style.transform = `translate(${spec.side === "left" ? "-100%" : "0"}, ${((1 - o) * 6).toFixed(1)}px)`;
  });
  return (
    <Html position={spec.position} zIndexRange={[0, 0]} style={{ pointerEvents: "none" }}>
      <div
        ref={el}
        className={
          spec.side === "left"
            ? "w-max border-r border-border-strong pr-2 text-right font-mono text-[11px] leading-4 text-ink-subtle"
            : "w-max border-l border-border-strong pl-2 font-mono text-[11px] leading-4 text-ink-subtle"
        }
        style={{ opacity: 0 }}
      >
        <div className="text-ink-muted">{spec.title}</div>
        <div>{spec.detail}</div>
      </div>
    </Html>
  );
}
