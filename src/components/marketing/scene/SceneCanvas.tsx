"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Lattice, cellPosition, type LatticeUniforms } from "./Lattice";
import { Packet } from "./Packet";
import { Perimeter, type PerimeterState } from "./Perimeter";
import { RedirectPath } from "./RedirectPath";
import { Extraction } from "./Extraction";
import { SceneLabels, type LabelSpec } from "./SceneLabels";
import { CAMERA, LATTICE_TILT, PRODUCTION, TARGET_CELL, TWIN } from "./scene-config";
import { sceneState, stageOf } from "./scene-state";

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeIn = (t: number) => t * t * t;

/** Moment within Detect when the packet lands on the target cell. */
const IMPACT = 0.76;

/** Fog follows the camera so depth reads the same at every dolly distance. */
function setFog(u: LatticeUniforms, camera: THREE.Camera) {
  const d = camera.position.z - PRODUCTION.origin[2];
  u.uFogNear.value = d - 2;
  u.uFogFar.value = d + 16;
}

interface SceneProps {
  density: number;
  parallax: boolean;
}

const wander = new THREE.Vector3();

function Scene({ density, parallax }: SceneProps) {
  const camera = useThree((s) => s.camera);
  const nz = Math.max(1, Math.round(PRODUCTION.size[2] * density));

  const geo = useMemo(() => {
    const tilt = new THREE.Euler(...LATTICE_TILT);
    const productionOrigin = new THREE.Vector3(...PRODUCTION.origin);
    const twinCenter = new THREE.Vector3(...TWIN.origin);
    const target = cellPosition(
      { ...PRODUCTION, size: [PRODUCTION.size[0], PRODUCTION.size[1], nz] },
      TARGET_CELL.ix,
      TARGET_CELL.iy,
      Math.min(TARGET_CELL.iz, nz - 1),
    );
    const targetWorld = target.clone().applyEuler(tilt).add(productionOrigin);
    const front = ((nz - 1) / 2) * PRODUCTION.gap + 1.6;
    const local = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyEuler(tilt).add(productionOrigin);
    const twinExtent: [number, number, number] = [
      ((TWIN.size[0] - 1) / 2) * TWIN.gap,
      ((TWIN.size[1] - 1) / 2) * TWIN.gap,
      ((nz - 1) / 2) * TWIN.gap,
    ];
    return {
      target,
      targetWorld,
      twinCenter,
      twinExtent,
      profile: twinCenter.clone().add(new THREE.Vector3(0.4, twinExtent[1] + 2.6, 0.6)),
      productionLabel: local(-((PRODUCTION.size[0] - 1) / 2) * PRODUCTION.gap - 0.4, ((PRODUCTION.size[1] - 1) / 2) * PRODUCTION.gap + 1.4, front - 1.2),
      twinLabel: twinCenter.clone().add(new THREE.Vector3(-twinExtent[0] - 0.4, twinExtent[1] + 1.5, twinExtent[2] + 0.4)),
      // Reconnaissance: the packet circles the hull, never touching it.
      recon: new THREE.CatmullRomCurve3(
        [local(-5.6, 2.6, front), local(-1.2, 3.4, front - 0.6), local(2.6, 1.4, front + 0.6), local(0.8, -2.6, front), local(-3.8, -3.0, front + 0.9), local(-6.2, -0.2, front - 0.4)],
        true,
        "catmullrom",
        0.6,
      ),
      approach: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-18, 3.6, 6),
        new THREE.Vector3(-11, 2.4, 4.2),
        new THREE.Vector3(-5.5, 1.6, 2.6),
        targetWorld.clone().add(new THREE.Vector3(-1.2, 0.4, 1.0)),
        targetWorld,
      ]),
      bend: new THREE.CatmullRomCurve3([
        targetWorld,
        targetWorld.clone().add(new THREE.Vector3(1.4, 1.2, 2.4)),
        new THREE.Vector3(3.4, 1.4, 1.6),
        twinCenter.clone().add(new THREE.Vector3(-2.2, 0.6, 1.2)),
        twinCenter,
      ]),
    };
  }, [nz]);

  const twinEntry = useMemo<[number, number, number]>(() => [-((TWIN.size[0] - 1) / 2) * TWIN.gap - 0.6, 0, 0], []);
  const productionEntry = useMemo<[number, number, number]>(() => [geo.target.x, geo.target.y, geo.target.z], [geo]);

  // Production: compromised in Detect, recedes into fog while the twin works,
  // returns untouched, and steps aside for the sandbox in the closing section.
  const updateProduction = (u: LatticeUniforms, group: THREE.Group) => {
    const { story, intro, cta } = sceneState;
    const { index, t } = stageOf(story);
    let hot = 0;
    let ring = 0;
    let fade = 1;
    if (story > 0 && story < 1) {
      if (index === 0) {
        hot = smooth(IMPACT - 0.02, IMPACT + 0.04, t);
        ring = smooth(IMPACT, 1, t) * 4.5;
      } else if (index === 1) {
        hot = 1;
        ring = 4.5 + t * 3;
      } else if (index === 2) {
        hot = 1 - smooth(0.1, 0.7, t);
        ring = 8;
        fade = 1 - 0.72 * smooth(0, 0.6, t);
      } else {
        fade = 0.28 + 0.72 * smooth(0.2, 0.8, t);
      }
    } else if (story >= 1) {
      fade = 1 - smooth(0, 0.7, cta);
    }
    fade *= 0.7 + 0.3 * smooth(0, 1, intro);
    u.uHot.value = hot;
    u.uRing.value = ring;
    u.uFade.value = fade;
    u.uHotCenter.value.copy(geo.target);
    setFog(u, camera);
    group.position.z = PRODUCTION.origin[2] - (1 - fade) * 8;
  };

  // The twin: hollow, amber, assembled only while a session is redirected
  // into it, and rebuilt as the sandbox lab in the closing section.
  const updateTwin = (u: LatticeUniforms) => {
    const { story, cta } = sceneState;
    const { index, t } = stageOf(story);
    let assemble = 0;
    if (story > 0 && story < 1) {
      if (index === 1) assemble = smooth(0.04, 0.92, t);
      else if (index === 2) assemble = 1;
      else if (index === 3) assemble = 1 - smooth(0.45, 1, t);
    } else if (story >= 1) {
      assemble = smooth(0.1, 0.9, cta);
    }
    u.uAssemble.value = assemble;
    u.uLure.value = smooth(0, 0.4, assemble);
    u.uHollow.value = 1;
    u.uFade.value = assemble > 0.001 ? 1 : 0;
    setFog(u, camera);
  };

  // Sensors: an idle sweep while nothing is happening, a fast sweep during
  // Detect, and the hull flashes danger on impact.
  const updatePerimeter = (s: PerimeterState, elapsed: number) => {
    const { story, intro, cta } = sceneState;
    const { index, t } = stageOf(story);
    s.hull = 1;
    s.danger = 0;
    s.scan = 0.6;
    s.scanX = (elapsed * 0.08) % 1;
    if (story <= 0) {
      s.hull = 0.7 + 0.3 * smooth(0, 1, intro);
    } else if (story < 1) {
      if (index === 0) {
        s.scanX = (elapsed * 0.35) % 1;
        s.scan = 1 - smooth(IMPACT, IMPACT + 0.1, t);
        s.danger = smooth(IMPACT - 0.02, IMPACT + 0.04, t);
      } else if (index === 1) {
        s.scan = 0;
        s.danger = 1 - smooth(0.3, 0.8, t);
      } else if (index === 2) {
        s.scan = 0;
        s.hull = 1 - 0.72 * smooth(0, 0.6, t);
      } else {
        s.scan = smooth(0.6, 1, t) * 0.6;
        s.hull = 0.28 + 0.72 * smooth(0.2, 0.8, t);
      }
    } else {
      s.hull = 1 - smooth(0, 0.7, cta);
      s.scan = 0.6 * (1 - smooth(0, 0.7, cta));
    }
  };

  const updatePath = (): readonly [number, number] => {
    const { story } = sceneState;
    const { index, t } = stageOf(story);
    if (story <= 0 || story >= 1) return [0, 0];
    if (index === 1) return [smooth(0, 0.55, t), 1];
    // Its job is done once the session is inside; it dims out of the way.
    if (index === 2) return [1, 1 - smooth(0.15, 0.7, t)];
    return [0, 0];
  };

  const updateExtraction = (): readonly [number, number] => {
    const { story } = sceneState;
    const { index, t } = stageOf(story);
    if (story <= 0 || story >= 1 || index !== 3) return [0, 0];
    return [smooth(0.05, 0.85, t), smooth(0, 0.18, t) * (1 - smooth(0.9, 1, t))];
  };

  const updatePacket = (pos: THREE.Vector3, elapsed: number): number => {
    const { story, intro, cta } = sceneState;
    const { index, t } = stageOf(story);
    if (story <= 0) {
      const u = (elapsed / 13) % 1;
      geo.recon.getPointAt(u, pos);
      pos.z += Math.sin(elapsed * 1.7) * 0.25;
      return 1 - smooth(0.55, 0.95, intro);
    }
    if (story >= 1) {
      // The lab: a session working inside the twin.
      wander.set(Math.sin(elapsed * 0.9) * 2.4, Math.sin(elapsed * 1.3 + 1.0) * 1.5, Math.sin(elapsed * 0.7 + 2.0) * 0.9);
      pos.copy(geo.twinCenter).add(wander);
      return smooth(0.3, 0.9, cta);
    }
    if (index === 0) {
      const u = clamp01(t / IMPACT);
      geo.approach.getPointAt(easeIn(u) * 0.999, pos);
      return smooth(0, 0.08, t);
    }
    if (index === 1) {
      geo.bend.getPointAt(easeInOut(t) * 0.999, pos);
      return 1;
    }
    const ramp = index === 2 ? smooth(0, 0.35, t) : 1;
    wander
      .set(Math.sin(elapsed * 0.9) * 2.4, Math.sin(elapsed * 1.3 + 1.0) * 1.5, Math.sin(elapsed * 0.7 + 2.0) * 0.9)
      .multiplyScalar(ramp);
    pos.copy(geo.twinCenter).add(wander);
    return index === 3 ? 1 - smooth(0.45, 0.85, t) : 1;
  };

  const labels = useMemo<LabelSpec[]>(
    () => [
      {
        id: "production",
        position: geo.productionLabel,
        title: "production",
        detail: "web-cluster-1 · 6 hosts · eBPF probes",
        opacity: () => {
          const { story, intro, cta } = sceneState;
          const { index, t } = stageOf(story);
          if (story <= 0) return smooth(0.5, 1, intro);
          if (story >= 1) return 1 - smooth(0, 0.5, cta);
          if (index === 2) return 1 - smooth(0, 0.5, t);
          if (index === 3) return smooth(0.3, 0.8, t);
          return 1;
        },
      },
      {
        id: "twin",
        position: geo.twinLabel,
        title: "twin",
        detail: "honey-web-01 · Proxmox · seeded",
        opacity: () => {
          const { story, cta } = sceneState;
          const { index, t } = stageOf(story);
          if (story <= 0) return 0;
          if (story >= 1) return smooth(0.4, 0.9, cta);
          if (index === 1) return smooth(0.5, 0.95, t);
          if (index === 2) return 1;
          if (index === 3) return 1 - smooth(0.3, 0.6, t);
          return 0;
        },
      },
      {
        id: "profile",
        position: geo.profile.clone().add(new THREE.Vector3(-0.9, 0.1, 0)),
        side: "left",
        title: "attacker profile",
        detail: "3 IOCs · T1552.001 · 185.220.101.3",
        opacity: () => {
          const { story } = sceneState;
          const { index, t } = stageOf(story);
          if (story <= 0 || story >= 1 || index !== 3) return 0;
          return smooth(0.2, 0.4, t) * (1 - smooth(0.9, 1, t));
        },
      },
    ],
    [geo],
  );

  return (
    <>
      <Lattice config={PRODUCTION} entry={productionEntry} density={density} update={updateProduction} />
      <Perimeter config={PRODUCTION} density={density} update={updatePerimeter} />
      <Lattice config={TWIN} entry={twinEntry} density={density} update={updateTwin} />
      <RedirectPath curve={geo.bend} update={updatePath} />
      <Extraction center={geo.twinCenter} extent={geo.twinExtent} profile={geo.profile} update={updateExtraction} />
      <Packet update={updatePacket} />
      <SceneLabels labels={labels} />
      <CameraRig parallax={parallax} />
    </>
  );
}

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

function CameraRig({ parallax }: { parallax: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA.hero.look));
  const initialised = useRef(false);

  useFrame((_, delta) => {
    const { intro, story, cta, pointerX, pointerY } = sceneState;
    const { index, t } = stageOf(story);

    // Base pose: hero -> detect as the hero scrolls away.
    const k = easeInOut(clamp01(intro));
    tmpPos.set(...CAMERA.hero.pos).lerp(a.set(...CAMERA.detect.pos), k);
    tmpLook.set(...CAMERA.hero.look).lerp(b.set(...CAMERA.detect.look), k);

    // Where the subject sits, for narrow viewports that must re-centre on it.
    let subjectX: number = PRODUCTION.origin[0];
    if (story > 0 && story < 1) {
      // detect -> pair (redirect) -> twin (deceive) -> pair (extract)
      let toPair = 0;
      let toTwin = 0;
      if (index === 1) toPair = smooth(0, 0.6, t);
      else if (index === 2) {
        toPair = 1;
        toTwin = smooth(0, 0.5, t);
      } else if (index === 3) {
        toPair = 1;
        toTwin = 1 - smooth(0, 0.5, t);
      }
      tmpPos.lerp(a.set(...CAMERA.pair.pos), toPair);
      tmpLook.lerp(b.set(...CAMERA.pair.look), toPair);
      tmpPos.lerp(a.set(...CAMERA.twin.pos), toTwin);
      tmpLook.lerp(b.set(...CAMERA.twin.look), toTwin);
      const pairX = (PRODUCTION.origin[0] + TWIN.origin[0]) / 2;
      subjectX = THREE.MathUtils.lerp(THREE.MathUtils.lerp(subjectX, pairX, toPair), TWIN.origin[0], toTwin);
    } else if (story >= 1) {
      const c = smooth(0, 1, cta);
      tmpPos.set(...CAMERA.pair.pos).lerp(a.set(...CAMERA.cta.pos), c);
      tmpLook.set(...CAMERA.pair.look).lerp(b.set(...CAMERA.cta.look), c);
      subjectX = THREE.MathUtils.lerp((PRODUCTION.origin[0] + TWIN.origin[0]) / 2, TWIN.origin[0], c);
    }

    // Narrow viewports: centre on the subject, pull back, and keep it in the
    // upper half so the copy below stays clear.
    const aspect = size.width / size.height;
    const narrow = clamp01((1.1 - aspect) / 0.6);
    if (narrow > 0) {
      const lift = 3.0;
      tmpPos.x = THREE.MathUtils.lerp(tmpPos.x, subjectX, narrow);
      tmpLook.x = THREE.MathUtils.lerp(tmpLook.x, subjectX, narrow);
      tmpPos.z += narrow * 15;
      tmpPos.y -= narrow * lift;
      tmpLook.y -= narrow * lift;
    }

    if (parallax) {
      tmpPos.x += pointerX * 0.9;
      tmpPos.y += pointerY * 0.5;
    }

    if (!initialised.current) {
      camera.position.copy(tmpPos);
      look.current.copy(tmpLook);
      initialised.current = true;
    } else {
      const l = 1 - Math.exp(-delta * 4.5);
      camera.position.lerp(tmpPos, l);
      look.current.lerp(tmpLook, l);
    }
    camera.lookAt(look.current);
  });
  return null;
}

interface SceneCanvasProps {
  density: number;
  parallax: boolean;
  dpr: [number, number];
  frameloop: "always" | "demand" | "never";
}

export default function SceneCanvas({ density, parallax, dpr, frameloop }: SceneCanvasProps) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={frameloop}
      camera={{ fov: CAMERA.fov, near: 0.5, far: 80, position: [...CAMERA.hero.pos] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <Scene density={density} parallax={parallax} />
    </Canvas>
  );
}
