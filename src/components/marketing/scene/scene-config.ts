/**
 * sRGB hex mirrors of the OKLCH tokens in globals.css (three.js cannot parse
 * oklch). Keep in sync with DESIGN.md when tokens change.
 */
export const COLORS = {
  bg: "#111318", // --bg
  face: "#1b1e24", // --surface-2
  edge: "#3a3e45", // --border-strong on --bg
  accent: "#e9b44c", // --accent
  danger: "#e0554a", // --danger
  ink: "#9aa0a8", // --ink-muted
} as const;

/** Both lattices share this tilt so cells show three faces. */
export const LATTICE_TILT = [0.14, -0.42, 0] as const;

/** Production lattice, world units. */
export const PRODUCTION = {
  origin: [-2.2, 0, -1] as const,
  size: [6, 5, 3] as const,
  gap: 1.05,
  cell: 0.56,
};

/** Twin lattice mirrors production on the right. */
export const TWIN = {
  origin: [6.2, 0, -1] as const,
  size: [6, 5, 3] as const,
  gap: 1.05,
  cell: 0.56,
};

/** Cell index the attacker lands on (production). Front face, upper right. */
export const TARGET_CELL = { ix: 5, iy: 3, iz: 2 };

/**
 * Camera poses. `pos.x === look.x` keeps the view parallel, so a pose only
 * decides where in the frame the lattices sit. Percentages assume a 16:10
 * viewport with the copy column ending around 43%.
 */
export const CAMERA = {
  fov: 30,
  /** Start of the dolly as the scene fades in past the hero: detect, further back. */
  hero: { pos: [-5.8, 1.4, 24] as const, look: [-5.8, 0, -1] as const },
  /** Detect: production alone, centred around 70%. */
  detect: { pos: [-3.4, 1.4, 17] as const, look: [-3.4, 0, -1] as const },
  /** Redirect and extract: both lattices in the right half. */
  pair: { pos: [-3.6, 2.2, 34] as const, look: [-3.6, 0, -1] as const },
  /** Deceive: dolly into the twin. */
  twin: { pos: [2.4, 1.4, 19] as const, look: [2.4, 0.2, -1] as const },
  /** Closing call to action: the twin as the sandbox lab, right of the copy. */
  cta: { pos: [2.4, 1.2, 21] as const, look: [2.4, 0, -1] as const },
};
