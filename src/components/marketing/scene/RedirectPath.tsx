"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";
import { COLORS } from "./scene-config";

const SEGMENTS = 96;

interface RedirectPathProps {
  curve: THREE.Curve<THREE.Vector3>;
  /** Returns [drawn 0..1, opacity 0..1]. */
  update: (elapsed: number) => readonly [number, number];
}

/**
 * The kernel rewrite: a dashed amber route from the compromised cell into the
 * twin, drawn ahead of the packet as Cilium moves the socket.
 */
export function RedirectPath({ curve, update }: RedirectPathProps) {
  const line = useRef<Line2>(null!);
  const points = useMemo(() => curve.getSpacedPoints(SEGMENTS), [curve]);

  useFrame(({ clock }) => {
    const [drawn, opacity] = update(clock.elapsedTime);
    const l = line.current;
    l.visible = drawn > 0.001 && opacity > 0.002;
    l.geometry.instanceCount = Math.max(0, Math.round(drawn * SEGMENTS));
    l.material.opacity = opacity;
    l.material.dashOffset = -clock.elapsedTime * 1.2;
  });

  return (
    <Line
      ref={line}
      points={points}
      color={COLORS.accent}
      lineWidth={1.5}
      dashed
      dashSize={0.28}
      gapSize={0.16}
      transparent
      depthWrite={false}
      frustumCulled={false}
    />
  );
}
