"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, LATTICE_TILT } from "./scene-config";

export interface LatticeConfig {
  origin: readonly [number, number, number];
  size: readonly [number, number, number];
  gap: number;
  cell: number;
}

export interface LatticeUniforms extends Record<string, THREE.IUniform> {
  uTime: { value: number };
  /** 0..1, cells scale in ordered by distance from the entry face. */
  uAssemble: { value: number };
  /** 0..1, amber edge tint (the lure). */
  uLure: { value: number };
  /** 0..1, overall alpha. */
  uFade: { value: number };
  /** 0..1, hollows the faces: the twin is a facade, edges only. */
  uHollow: { value: number };
  /** Compromise: intensity, centre (lattice local), and ripple radius. */
  uHot: { value: number };
  uHotCenter: { value: THREE.Vector3 };
  uRing: { value: number };
  uFogNear: { value: number };
  uFogFar: { value: number };
  uFace: { value: THREE.Color };
  uEdge: { value: THREE.Color };
  uAccent: { value: THREE.Color };
  uDanger: { value: THREE.Color };
}

const vertex = /* glsl */ `
  attribute float aOrder;
  uniform float uTime;
  uniform float uAssemble;
  uniform float uHot;
  uniform vec3 uHotCenter;
  uniform float uRing;
  varying vec2 vUv;
  varying float vDepth;
  varying float vHot;

  void main() {
    vUv = uv;
    vec3 center = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float s = smoothstep(aOrder, aOrder + 0.35, uAssemble * 1.35);
    s *= 1.0 + 0.025 * sin(uTime * 0.7 + aOrder * 14.0);
    vec4 world = modelMatrix * instanceMatrix * vec4(position * s, 1.0);
    float d = distance(center, uHotCenter);
    float target = 1.0 - step(0.2, d);
    float ring = (1.0 - smoothstep(0.0, 1.1, abs(d - uRing))) * (1.0 - smoothstep(0.0, 7.0, uRing));
    vHot = uHot * max(target, ring * 0.55);
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uFace;
  uniform vec3 uEdge;
  uniform vec3 uAccent;
  uniform vec3 uDanger;
  uniform float uLure;
  uniform float uFade;
  uniform float uHollow;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec2 vUv;
  varying float vDepth;
  varying float vHot;

  void main() {
    // Constant-width hairline on every face edge regardless of distance.
    vec2 w = fwidth(vUv) * 1.1;
    vec2 m = min(vUv, 1.0 - vUv);
    vec2 a = smoothstep(vec2(0.0), w, m);
    float edge = 1.0 - min(a.x, a.y);

    vec3 edgeCol = mix(uEdge, uAccent, uLure);
    edgeCol = mix(edgeCol, uDanger, vHot);
    vec3 faceCol = mix(uFace, uDanger, vHot * 0.35);
    faceCol = mix(faceCol, uAccent, uLure * 0.06);

    vec3 col = mix(faceCol, edgeCol, edge);
    float alpha = mix(0.5 * (1.0 - uHollow * 0.85), 1.0, edge);
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    alpha *= (1.0 - fog) * uFade;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

interface LatticeProps {
  config: LatticeConfig;
  /** Local point cells assemble outward from. */
  entry: readonly [number, number, number];
  /** Scale factor for cell count on small screens. */
  density?: number;
  update: (u: LatticeUniforms, group: THREE.Group, elapsed: number) => void;
}

export function Lattice({ config, entry, density = 1, update }: LatticeProps) {
  const group = useRef<THREE.Group>(null!);
  const material = useRef<THREE.ShaderMaterial>(null!);

  const { count, matrices, orders } = useMemo(() => {
    const [sx, sy, sz] = config.size;
    const nz = Math.max(1, Math.round(sz * density));
    const total = sx * sy * nz;
    const matrices = new Float32Array(total * 16);
    const orders = new Float32Array(total);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const e = new THREE.Vector3(...entry);
    let i = 0;
    let maxD = 0;
    const centers: THREE.Vector3[] = [];
    for (let ix = 0; ix < sx; ix++)
      for (let iy = 0; iy < sy; iy++)
        for (let iz = 0; iz < nz; iz++) {
          const p = new THREE.Vector3(
            (ix - (sx - 1) / 2) * config.gap,
            (iy - (sy - 1) / 2) * config.gap,
            (iz - (nz - 1) / 2) * config.gap,
          );
          centers.push(p);
          maxD = Math.max(maxD, p.distanceTo(e));
        }
    for (const p of centers) {
      // Deterministic size variance: a cluster, not a grid.
      const h = Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233 + p.z * 37.719) * 43758.5453) % 1;
      sc.setScalar(0.72 + 0.42 * h);
      m.compose(p, q, sc);
      m.toArray(matrices, i * 16);
      orders[i] = (p.distanceTo(e) / maxD) * 0.75;
      i++;
    }
    return { count: total, matrices, orders };
  }, [config, entry, density]);

  const uniforms = useMemo<LatticeUniforms>(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: 1 },
      uLure: { value: 0 },
      uFade: { value: 1 },
      uHollow: { value: 0 },
      uHot: { value: 0 },
      uHotCenter: { value: new THREE.Vector3(999, 999, 999) },
      uRing: { value: 0 },
      uFogNear: { value: 22 },
      uFogFar: { value: 48 },
      uFace: { value: new THREE.Color(COLORS.face) },
      uEdge: { value: new THREE.Color(COLORS.edge) },
      uAccent: { value: new THREE.Color(COLORS.accent) },
      uDanger: { value: new THREE.Color(COLORS.danger) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const u = material.current.uniforms as LatticeUniforms;
    u.uTime.value = clock.elapsedTime;
    update(u, group.current, clock.elapsedTime);
  });

  return (
    <group ref={group} position={config.origin} rotation={LATTICE_TILT}>
      <instancedMesh
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[config.cell, config.cell, config.cell]}>
          <instancedBufferAttribute attach="attributes-aOrder" args={[orders, 1]} />
        </boxGeometry>
        <instancedBufferAttribute attach="instanceMatrix" args={[matrices, 16]} />
        <shaderMaterial
          ref={material}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </instancedMesh>
    </group>
  );
}

/** Lattice-local position of a cell index. */
export function cellPosition(config: LatticeConfig, ix: number, iy: number, iz: number): THREE.Vector3 {
  const [sx, sy, sz] = config.size;
  return new THREE.Vector3(
    (ix - (sx - 1) / 2) * config.gap,
    (iy - (sy - 1) / 2) * config.gap,
    (iz - (sz - 1) / 2) * config.gap,
  );
}
