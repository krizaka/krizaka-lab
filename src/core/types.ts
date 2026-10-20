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

export type IconType =
  | "doc"
  | "video"
  | "chart"
  | "calendar"
  | "chat"
  | "voice"
  | "brain"
  | "cpu"
  | "shield"
  | "zap";

export type FlowDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "radial";

export type FlowMode = "inbound" | "outbound" | "bidirectional";

export type ParticleStyle = "photons" | "data-blocks" | "beams" | "minimal";

export type ConduitStyle = "smooth-bezier" | "straight" | "cyber-grid";

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
  progress: number; // 0 to 1 along curve
  speed: number;
  size: number;
  alpha: number;
  color: string;
  glowColor: string;
  isOutbound?: boolean;
  dataPayload?: {
    requestId: string;
    latencyMs: number;
    tokens: number;
    label?: string;
  };
}

export interface ProductSourceNode {
  id: ProductId;
  name: string;
  subtitle: string;
  iconType: IconType;
  x: number;
  y: number;
  color: string;
  accent: string;
  status: "active" | "streaming" | "idle";
  enabled: boolean;
  packetRate: number;
  activeRequests: number;
}

export type YororisState = "idle" | "listening" | "speaking" | "breathing" | "reflecting";

export interface YororisConfig {
  state: YororisState;
  breathingCycleSeconds: number;
  intensity: number;
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
