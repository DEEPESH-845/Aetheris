/**
 * Mutable scene state written by GSAP (scroll, pointer) and read by
 * three.js every frame. Kept outside React so scrubbing never re-renders.
 *
 * `intro`: 0 at the top of the hero, 1 when the story section reaches the top.
 * `story`: 0..1 across the pinned "how it works" section (four equal stages).
 * `cta`:   0..1 as the closing call to action scrolls into view.
 */
export const sceneState = {
  intro: 0,
  story: 0,
  cta: 0,
  pointerX: 0,
  pointerY: 0,
};

export type Stage = "detect" | "redirect" | "deceive" | "extract";

export const STAGES: Stage[] = ["detect", "redirect", "deceive", "extract"];

/** Story progress split into the current stage and progress within it. */
export function stageOf(story: number): { index: number; t: number } {
  const clamped = Math.min(Math.max(story, 0), 0.9999);
  const index = Math.floor(clamped * 4);
  return { index, t: clamped * 4 - index };
}
