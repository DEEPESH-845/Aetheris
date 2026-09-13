"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LatticeConfig } from "./Lattice";
import { COLORS, LATTICE_TILT } from "./scene-config";

export interface PerimeterState {
  /** Hull opacity 0..1. */
  hull: number;
  /** 0..1, hull tints toward danger. */
  danger: number;
  /** Scan plane position across the lattice, 0..1 along x. */
  scanX: number;
  /** Scan plane opacity 0..1. */
  scan: number;
}

interface PerimeterProps {
  config: LatticeConfig;
  density: number;
  update: (s: PerimeterState, elapsed: number) => void;
}

const edgeColor = new THREE.Color(COLORS.edge);
const dangerColor = new THREE.Color(COLORS.danger);

/**
 * The sensors: a hairline hull around production (Zeek, Suricata, eBPF at the
 * edge) and a translucent plane that sweeps the cluster like a probe.
 */
export function Perimeter({ config, density, update }: PerimeterProps) {
  const hull = useRef<THREE.LineSegments>(null!);
  const scan = useRef<THREE.Mesh>(null!);
  const state = useRef<PerimeterState>({ hull: 1, danger: 0, scanX: 0, scan: 0 });

  const { size, geometry } = useMemo(() => {
    const [sx, sy, sz] = config.size;
    const nz = Math.max(1, Math.round(sz * density));
    const pad = config.cell * 0.9;
    const size: [number, number, number] = [
      (sx - 1) * config.gap + config.cell + pad * 2,
      (sy - 1) * config.gap + config.cell + pad * 2,
      (nz - 1) * config.gap + config.cell + pad * 2,
    ];
    return { size, geometry: new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)) };
  }, [config, density]);

  useFrame(({ clock }) => {
    const s = state.current;
    update(s, clock.elapsedTime);
    const hm = hull.current.material as THREE.LineBasicMaterial;
    hm.opacity = 0.9 * s.hull;
    hm.color.copy(edgeColor).lerp(dangerColor, s.danger);
    hull.current.visible = s.hull > 0.002;
    const sm = scan.current.material as THREE.MeshBasicMaterial;
    sm.opacity = 0.14 * s.scan;
    scan.current.visible = s.scan > 0.002;
    scan.current.position.x = (s.scanX - 0.5) * size[0];
  });

  return (
    <group position={config.origin} rotation={LATTICE_TILT}>
      <lineSegments ref={hull} geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial color={COLORS.edge} transparent depthWrite={false} />
      </lineSegments>
      <mesh ref={scan} rotation={[0, Math.PI / 2, 0]} frustumCulled={false}>
        <planeGeometry args={[size[2], size[1]]} />
        <meshBasicMaterial color={COLORS.accent} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}
