"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail, type MeshLineGeometry } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "./scene-config";

interface PacketProps {
  /** Writes the packet's world position, returns intensity 0..1 (0 hides it). */
  update: (position: THREE.Vector3, elapsed: number) => number;
}

/** The attacker: one amber point and the path it leaves behind. */
export function Packet({ update }: PacketProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const trail = useRef<MeshLineGeometry>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    const m = mesh.current;
    const k = update(m.position, clock.elapsedTime);
    const s = 0.6 + 0.4 * k;
    m.scale.setScalar(s * (k > 0.001 ? 1 : 0));
    mat.current.opacity = k;
    const tm = trail.current?.material as THREE.Material | undefined;
    if (tm) {
      tm.transparent = true;
      tm.depthWrite = false;
      tm.opacity = 0.85 * k;
    }
  });

  return (
    <>
      <mesh ref={mesh} frustumCulled={false}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshBasicMaterial ref={mat} color={COLORS.accent} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <Trail
        ref={trail}
        target={mesh}
        width={1.6}
        length={9}
        decay={1}
        attenuation={(w) => w * w}
        color={COLORS.accent}
      />
    </>
  );
}
