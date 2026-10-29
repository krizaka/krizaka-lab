/**
 * @krizaka/motion — Jarvis Holographic HUD Engine (V2 Next-Level)
 * Cinema-grade Iron Man Mark LXXXV interface with interactive click-to-lock targeting,
 * flight telemetry, energy shunt matrix, and multi-plane 3D gyroscopic projection.
 * 100% self-contained in krizaka-lab.
 */

import { JarvisTheme, Point2D } from "./types";
import { JARVIS_THEMES } from "./color-palettes";

export type JarvisTacticalMode = "standard" | "combat" | "stealth" | "overdrive";

export interface TargetLock {
  x: number;
  y: number;
  distanceMeters: number;
  threatLevel: "MINIMAL" | "ELEVATED" | "CRITICAL";
  lockedAt: number;
}

export interface JarvisHUDOptions {
  theme?: JarvisTheme;
  tacticalMode?: JarvisTacticalMode;
  interactive3D?: boolean;
  overdrive?: boolean;
  rotationSpeed?: number;
  showDiagnostics?: boolean;
  showEnergyMatrix?: boolean;
  targetPoint?: Point2D;
  onTargetLocked?: (target: TargetLock) => void;
}

export class JarvisHUDRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: JarvisHUDOptions;
  private width = 600;
  private height = 600;
  private dpr = 1;

  private theme: JarvisTheme = "cyan";
  private time = 0;

  // 3D Gyroscope & Parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetTiltX = 0;
  private targetTiltY = 0;
  private currentTiltX = 0;
  private currentTiltY = 0;

  // Active Target Locks
  private targetLock: TargetLock | null = null;

  // Energy distribution shunts (%)
  private energyDistribution = {
    repulsors: 85,
    shields: 94,
    unibeam: 60,
    thrusters: 78,
  };

  private audioSpectrum: number[] = new Array(48).fill(0);

  constructor(canvas: HTMLCanvasElement, options: JarvisHUDOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;

    this.options = {
      theme: "cyan",
      tacticalMode: "standard",
      interactive3D: true,
      overdrive: false,
      rotationSpeed: 1.0,
      showDiagnostics: true,
      showEnergyMatrix: true,
      ...options,
    };
    this.theme = this.options.theme || "cyan";

    this.initLayout(canvas.clientWidth || 600, canvas.clientHeight || 600, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<JarvisHUDOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.theme) {
      this.theme = options.theme;
    }
  }

  public setTacticalMode(mode: JarvisTacticalMode): void {
    this.options.tacticalMode = mode;
    if (mode === "overdrive") {
      this.options.overdrive = true;
    } else if (mode === "stealth") {
      this.theme = "sage";
      this.options.overdrive = false;
    } else {
      this.options.overdrive = false;
    }
  }

  public setDimensions(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
  }

  private setupEvents(): void {
    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      this.targetTiltX = (y / (rect.height / 2)) * 0.42;
      this.targetTiltY = (-x / (rect.width / 2)) * 0.42;
      this.mouseX = clientX - rect.left;
      this.mouseY = clientY - rect.top;
    };

    this.canvas.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches[0]) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // Click anywhere to lock onto target
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const dist = Math.round(800 + Math.random() * 2400);
      const threat = dist < 1200 ? "CRITICAL" : dist < 1800 ? "ELEVATED" : "MINIMAL";

      const lock: TargetLock = {
        x: clickX,
        y: clickY,
        distanceMeters: dist,
        threatLevel: threat,
        lockedAt: performance.now(),
      };
      this.targetLock = lock;
      if (this.options.onTargetLocked) {
        this.options.onTargetLocked(lock);
      }
    });

    const resetTilt = () => {
      this.targetTiltX = 0;
      this.targetTiltY = 0;
    };
    this.canvas.addEventListener("mouseleave", resetTilt);
    this.canvas.addEventListener("touchend", resetTilt);
  }

  /** Locks onto a spatial coordinate */
  public lockTargetAt(x: number, y: number): TargetLock {
    const dist = Math.round(800 + Math.random() * 2400);
    const threat = dist < 1200 ? "CRITICAL" : dist < 1800 ? "ELEVATED" : "MINIMAL";

    const lock: TargetLock = {
      x,
      y,
      distanceMeters: dist,
      threatLevel: threat,
      lockedAt: performance.now(),
    };
    this.targetLock = lock;
    if (this.options.onTargetLocked) {
      this.options.onTargetLocked(lock);
    }
    return lock;
  }

  /** Clears active lock */
  public clearTargetLock(): void {
    this.targetLock = null;
  }

  /** Returns current lock */
  public getTargetLock(): TargetLock | null {
    return this.targetLock;
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime * (this.options.rotationSpeed || 1.0);
    const ctx = this.ctx;
    const dpr = this.dpr;

    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * Math.min(deltaTime * 8, 0.35);
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * Math.min(deltaTime * 8, 0.35);

    this.updateAudioEqualizer(deltaTime);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.38;

    const isOverdrive = this.options.overdrive || this.options.tacticalMode === "overdrive";
    const themeColors = isOverdrive ? JARVIS_THEMES.crimson : JARVIS_THEMES[this.theme];

    // 1. Draw cyber grid & ambient HUD field
    this.drawCyberGrid(ctx, cx, cy, baseRadius, themeColors);

    // Apply 3D perspective transform
    ctx.save();
    ctx.translate(cx, cy);

    const tiltScaleX = Math.cos(this.currentTiltY);
    const tiltScaleY = Math.cos(this.currentTiltX);
    const skewX = this.currentTiltY * 0.3;
    const skewY = this.currentTiltX * 0.3;

    ctx.transform(tiltScaleX, skewY, skewX, tiltScaleY, 0, 0);

    // 2. Draw outer boundary brackets & tactical compass
    this.drawOuterReticles(ctx, baseRadius, themeColors);

    // 3. Draw concentric rotating telemetry rings
    this.drawTelemetryRings(ctx, baseRadius, themeColors);

    // 4. Draw radial audio spectrum analyzer
    this.drawRadialSpectrum(ctx, baseRadius * 0.58, themeColors);

    // 5. Draw Central ARC Reactor Core
    this.drawArcReactor(ctx, baseRadius * 0.32, themeColors);

    ctx.restore();

    // 6. Draw interactive locked target reticle
    if (this.targetLock) {
      this.drawTargetLock(ctx, themeColors);
    }

    // 7. Draw HUD Overlay telemetry & power matrix
    if (this.options.showDiagnostics) {
      this.drawDiagnosticsHUD(ctx, themeColors, isOverdrive);
    }

    ctx.restore();
  }

  private updateAudioEqualizer(deltaTime: number): void {
    for (let i = 0; i < this.audioSpectrum.length; i++) {
      const target = 0.2 + Math.abs(Math.sin(this.time * 6 + i * 0.4)) * 0.5 + Math.sin(this.time * 12 + i * 0.8) * 0.3;
      this.audioSpectrum[i] += (target - this.audioSpectrum[i]) * Math.min(deltaTime * 12, 0.4);
    }
  }

  private drawCyberGrid(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    theme: (typeof JARVIS_THEMES)["cyan"],
  ): void {
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.5);
    grad.addColorStop(0, theme.bgGlow);
    grad.addColorStop(0.7, theme.bgGlow);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tactile hexagonal coordinate circles
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (i * 0.35), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawOuterReticles(ctx: CanvasRenderingContext2D, r: number, theme: (typeof JARVIS_THEMES)["cyan"]): void {
    ctx.save();
    const bracketSize = r * 1.18;
    const cornerArm = 26;
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 8;

    const corners = [
      { x: -bracketSize, y: -bracketSize, dx: 1, dy: 1 },
      { x: bracketSize, y: -bracketSize, dx: -1, dy: 1 },
      { x: bracketSize, y: bracketSize, dx: -1, dy: -1 },
      { x: -bracketSize, y: bracketSize, dx: 1, dy: -1 },
    ];

    for (const c of corners) {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * cornerArm);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * cornerArm, c.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTelemetryRings(ctx: CanvasRenderingContext2D, r: number, theme: (typeof JARVIS_THEMES)["cyan"]): void {
    ctx.save();

    // Ring 1: Fast counter-clockwise azimuth
    ctx.save();
    ctx.rotate(-this.time * 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([16, 28, 4, 12]);
    ctx.stroke();

    for (let i = 0; i < 72; i++) {
      const angle = (i * Math.PI * 2) / 72;
      const isMajor = i % 6 === 0;
      const len = isMajor ? 9 : 4;
      const r1 = r * 0.94;
      const r2 = r1 - len;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = isMajor ? theme.primary : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = isMajor ? 1.6 : 0.8;
      ctx.stroke();
    }
    ctx.restore();

    // Ring 2: Clockwise precision sectors
    ctx.save();
    ctx.rotate(this.time * 0.45);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([48, 16, 12, 16, 80, 24]);
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawRadialSpectrum(ctx: CanvasRenderingContext2D, r: number, theme: (typeof JARVIS_THEMES)["cyan"]): void {
    ctx.save();
    ctx.rotate(this.time * 0.2);

    const count = this.audioSpectrum.length;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const amp = this.audioSpectrum[i];
      const barLen = amp * 20;

      const r1 = r;
      const r2 = r + barLen;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.accent;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawArcReactor(ctx: CanvasRenderingContext2D, r: number, theme: (typeof JARVIS_THEMES)["cyan"]): void {
    ctx.save();

    // 1. Outer rim
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#060a0f";
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.stroke();

    // 2. 10 Rotating copper coils
    ctx.save();
    ctx.rotate(this.time * 0.5);
    const coilCount = 10;
    for (let i = 0; i < coilCount; i++) {
      const angle = (i * Math.PI * 2) / coilCount;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(r * 0.75, 0);

      ctx.fillStyle = "#b45309";
      ctx.fillRect(-4, -6, 8, 12);
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -6, 8, 12);
      ctx.restore();
    }
    ctx.restore();

    // 3. Central plasma singularity
    const pulse = Math.sin(this.time * 8) * 0.12;
    const coreR = r * 0.42 * (1 + pulse);

    const plasmaGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, coreR);
    plasmaGrad.addColorStop(0, "#ffffff");
    plasmaGrad.addColorStop(0.4, theme.accent);
    plasmaGrad.addColorStop(0.8, theme.primary);
    plasmaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    ctx.arc(0, 0, coreR * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = plasmaGrad;
    ctx.fill();

    // 4. Triangular Arc reactor emblem
    ctx.save();
    ctx.rotate(-this.time * 1.2);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const triAngle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const tx = Math.cos(triAngle) * (coreR * 0.85);
      const ty = Math.sin(triAngle) * (coreR * 0.85);
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawTargetLock(ctx: CanvasRenderingContext2D, theme: (typeof JARVIS_THEMES)["cyan"]): void {
    if (!this.targetLock) return;

    const { x, y, distanceMeters, threatLevel } = this.targetLock;
    const boxSize = 28;

    ctx.save();
    ctx.strokeStyle = threatLevel === "CRITICAL" ? "#ef4444" : theme.accent;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;

    // Target box corners
    const arm = 8;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(x - boxSize, y - boxSize + arm);
    ctx.lineTo(x - boxSize, y - boxSize);
    ctx.lineTo(x - boxSize + arm, y - boxSize);
    // Top-right
    ctx.moveTo(x + boxSize - arm, y - boxSize);
    ctx.lineTo(x + boxSize, y - boxSize);
    ctx.lineTo(x + boxSize, y - boxSize + arm);
    // Bottom-right
    ctx.moveTo(x + boxSize, y + boxSize - arm);
    ctx.lineTo(x + boxSize, y + boxSize);
    ctx.lineTo(x + boxSize - arm, y + boxSize);
    // Bottom-left
    ctx.moveTo(x - boxSize + arm, y + boxSize);
    ctx.lineTo(x - boxSize, y + boxSize);
    ctx.lineTo(x - boxSize, y + boxSize - arm);
    ctx.stroke();

    // Target center pip
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();

    // Target data label
    ctx.font = "9.5px SF Mono, monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`LOCKED · ${distanceMeters} M`, x + boxSize + 6, y - 6);
    ctx.fillStyle = threatLevel === "CRITICAL" ? "#ef4444" : theme.primary;
    ctx.fillText(`THREAT: ${threatLevel}`, x + boxSize + 6, y + 8);

    ctx.restore();
  }

  private drawDiagnosticsHUD(
    ctx: CanvasRenderingContext2D,
    theme: (typeof JARVIS_THEMES)["cyan"],
    isOverdrive: boolean,
  ): void {
    ctx.save();
    ctx.font = "10.5px SF Mono, monospace";
    ctx.fillStyle = theme.primary;
    ctx.textBaseline = "top";

    // Top-Left Telemetry
    ctx.fillText("KRIZAKA // HUD STUDY", 22, 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(`SIGNAL: 1.21`, 22, 40);
    ctx.fillText(`NEURAL CORE: 99.4% NOMINAL`, 22, 56);

    // Energy Shunt readout
    if (this.options.showEnergyMatrix) {
      ctx.fillStyle = theme.secondary;
      ctx.fillText(`REPULSORS: [${this.energyDistribution.repulsors}%]`, 22, 74);
      ctx.fillText(`SHIELDS:   [${this.energyDistribution.shields}%]`, 22, 90);
    }

    // Top-Right Status
    ctx.textAlign = "right";
    ctx.fillStyle = isOverdrive ? "#ef4444" : theme.primary;
    ctx.fillText(isOverdrive ? "OVERDRIVE // WARNING" : "TACTICAL: OPTIMAL", this.width - 22, 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(`PITCH: ${(this.currentTiltX * 57.3).toFixed(1)}°`, this.width - 22, 40);
    ctx.fillText(`YAW:   ${(this.currentTiltY * 57.3).toFixed(1)}°`, this.width - 22, 56);
    ctx.fillText(`MODE:  ${(this.options.tacticalMode || "standard").toUpperCase()}`, this.width - 22, 72);

    // Bottom Status
    ctx.textAlign = "center";
    ctx.fillStyle = theme.secondary;
    ctx.fillText(
      isOverdrive ? "OVERDRIVE · ALL RINGS AT FULL SPEED" : "CLICK ANYWHERE TO LOCK A TARGET",
      this.width / 2,
      this.height - 24,
    );

    ctx.restore();
  }
}
