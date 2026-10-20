/**
 * @krizaka/motion — Core Type Definitions
 * Shared types for generative physics, canvas rendering, and synthesis engines.
 */

export type ProductId =
  | "orazaka"
  | "yomizaka"
  | "orochia"
  | "kachizaka"
  | "akinaza"
  | "yasakia"
  | "yororis";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  id: number;
  sourceId: ProductId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  progress: number; // 0 to 1 along Bezier curve
  speed: number;
  size: number;
  alpha: number;
  color: string;
  glowColor: string;
  dataPayload?: {
    requestId: string;
    latencyMs: number;
    tokens: number;
  };
}

export interface ProductSourceNode {
  id: ProductId;
  name: string;
  x: number;
  y: number;
  color: string;
  accent: string;
  status: "active" | "streaming" | "idle";
  packetRate: number;
  activeRequests: number;
}

export type YororisState = "idle" | "listening" | "speaking" | "breathing" | "reflecting";

export interface YororisConfig {
  state: YororisState;
  breathingCycleSeconds: number; // e.g. 19s for 4-7-8
  intensity: number; // 0 to 1
  audioFrequencies?: Float32Array | number[];
  colorBase: string;
  colorAura: string;
  glowIntensity: number;
}

export type JarvisTheme = "cyan" | "orazaka" | "yororis" | "crimson" | "gold";

export interface JarvisConfig {
  theme: JarvisTheme;
  interactive3D: boolean;
  overdrive: boolean;
  rotationSpeedMultiplier: number;
  corePulseRate: number;
  reticleTarget?: Point2D;
  telemetryStatus: string;
}
