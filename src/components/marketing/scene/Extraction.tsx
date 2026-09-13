"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "./scene-config";

const COUNT = 56;

interface ExtractionProps {
  /** World-space centre of the twin and its half extents. */
  center: THREE.Vector3;
  extent: readonly [number, number, number];
  /** Where captured indicators collect: the attacker profile. */
  profile: THREE.Vector3;
  /** Returns [capture progress 0..1, profile node scale 0..1]. */
  update: (elapsed: number) => readonly [number, number];
}

const tmp = new THREE.Vector3();

/**
 * Extraction: indicators lift out of the twin and gather into the profile
 * node, an octahedron that only exists once the first IOC lands.
 */
export function Extraction({ center, extent, profile, update }: ExtractionProps) {
  const points = useRef<THREE.Points>(null!);
  const node = useRef<THREE.LineSegments>(null!);

  const { positions, starts, delays } = useMemo(() => {
    const starts = new Float32Array(COUNT * 3);
    const delays = new Float32Array(COUNT);
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < COUNT; i++) {
      starts[i * 3] = center.x + (rnd() * 2 - 1) * extent[0];
      starts[i * 3 + 1] = center.y + (rnd() * 2 - 1) * extent[1];
      starts[i * 3 + 2] = center.z + (rnd() * 2 - 1) * extent[2];
      delays[i] = rnd() * 0.55;
    }
    return { positions: starts.slice(), starts, delays };
  }, [center, extent]);

  const nodeGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.42)), []);

  useFrame(({ clock }) => {
    const [progress, scale] = update(clock.elapsedTime);
    const p = points.current;
    p.visible = progress > 0.001 && progress < 0.999;
    if (p.visible) {
      const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const k = THREE.MathUtils.clamp((progress - delays[i]) / 0.45, 0, 1);
        const e = 1 - (1 - k) ** 3;
        tmp.set(starts[i * 3], starts[i * 3 + 1], starts[i * 3 + 2]).lerp(profile, e);
        // A slight arc so the paths read as pulled, not teleported.
        tmp.y += Math.sin(e * Math.PI) * 0.8;
        arr[i * 3] = tmp.x;
        arr[i * 3 + 1] = tmp.y;
        arr[i * 3 + 2] = tmp.z;
      }
      attr.needsUpdate = true;
      (p.material as THREE.PointsMaterial).opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.85, 1);
    }
    const n = node.current;
    n.visible = scale > 0.001;
    n.scale.setScalar(scale);
    n.rotation.y = clock.elapsedTime * 0.5;
    n.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.3;
  });

  return (
    <>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={COLORS.accent} size={0.11} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
      </points>
      <lineSegments ref={node} geometry={nodeGeometry} position={profile} frustumCulled={false}>
        <lineBasicMaterial color={COLORS.accent} transparent depthWrite={false} toneMapped={false} />
      </lineSegments>
    </>
  );
}
