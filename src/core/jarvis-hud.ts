/**
 * @krizaka/motion — Jarvis Holographic HUD Engine (Iron Man Mark LXXXV)
 * Ultra-realistic holographic AI interface with Arc Reactor, concentric telemetry rings,
 * 3D gyroscopic tilt tracking, and dynamic cyber-optics.
 * 100% self-contained in krizaka-motion.
 */

import { JarvisTheme, Point2D } from "./types";
import { JARVIS_THEMES } from "./color-palettes";

export interface JarvisHUDOptions {
  theme?: JarvisTheme;
  interactive3D?: boolean;
  overdrive?: boolean;
  rotationSpeed?: number;
  showDiagnostics?: boolean;
  targetPoint?: Point2D;
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

  // 3D Gyroscope & Parallax mouse tracking
  private mouseX = 0;
  private mouseY = 0;
  private targetTiltX = 0;
  private targetTiltY = 0;
  private currentTiltX = 0;
  private currentTiltY = 0;

  // Telemetry simulation data
  private coreTemp = 3200;
  private fluxLevel = 98.4;
  private audioSpectrum: number[] = new Array(48).fill(0);

  constructor(canvas: HTMLCanvasElement, options: JarvisHUDOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;
    this.options = {
      theme: "cyan",
      interactive3D: true,
      overdrive: false,
      rotationSpeed: 1.0,
      showDiagnostics: true,
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

  public setTheme(theme: JarvisTheme): void {
    this.theme = theme;
    this.options.theme = theme;
  }

  public setOverdrive(overdrive: boolean): void {
    this.options.overdrive = overdrive;
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
    if (!this.options.interactive3D) return;

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      // Max tilt angles: ~24 degrees
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

    const resetTilt = () => {
      this.targetTiltX = 0;
      this.targetTiltY = 0;
    };
    this.canvas.addEventListener("mouseleave", resetTilt);
    this.canvas.addEventListener("touchend", resetTilt);
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime * (this.options.rotationSpeed || 1.0);
    const ctx = this.ctx;
    const dpr = this.dpr;

    // Smooth tilt interpolation
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * Math.min(deltaTime * 8, 0.35);
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * Math.min(deltaTime * 8, 0.35);

    // Update telemetry and audio equalizer simulation
    this.updateAudioEqualizer(deltaTime);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.38;

    const themeColors = this.options.overdrive ? JARVIS_THEMES.crimson : JARVIS_THEMES[this.theme];

    // 1. Draw background cyber grid & ambient HUD field
    this.drawCyberGrid(ctx, cx, cy, baseRadius, themeColors);

    // Apply 3D perspective transform
    ctx.save();
    ctx.translate(cx, cy);

    // Simulated 3D tilt using skew and scaling
    const tiltScaleX = Math.cos(this.currentTiltY);
    const tiltScaleY = Math.cos(this.currentTiltX);
    const skewX = this.currentTiltY * 0.3;
    const skewY = this.currentTiltX * 0.3;

    ctx.transform(tiltScaleX, skewY, skewX, tiltScaleY, 0, 0);

    // 2. Draw outer boundary reticles and compass arcs
    this.drawOuterReticles(ctx, baseRadius, themeColors);

    // 3. Draw concentric rotating telemetry rings
    this.drawTelemetryRings(ctx, baseRadius, themeColors);

    // 4. Draw radial audio spectrum analyzer
    this.drawRadialSpectrum(ctx, baseRadius * 0.58, themeColors);

    // 5. Draw Central ARC Reactor Core
    this.drawArcReactor(ctx, baseRadius * 0.32, themeColors);

    // 6. Draw targeting reticle
    this.drawTargetReticle(ctx, themeColors);

    ctx.restore();

    // 7. Draw HUD Overlay telemetry text & diagnostics
    if (this.options.showDiagnostics) {
      this.drawDiagnosticsHUD(ctx, themeColors);
    }

    ctx.restore();
  }

  private updateAudioEqualizer(deltaTime: number): void {
    for (let i = 0; i < this.audioSpectrum.length; i++) {
      const target =
        0.2 +
        Math.abs(Math.sin(this.time * 6 + i * 0.4)) * 0.5 +
        Math.sin(this.time * 12 + i * 0.8) * 0.3;
      this.audioSpectrum[i] += (target - this.audioSpectrum[i]) * Math.min(deltaTime * 12, 0.4);
    }
  }

  private drawCyberGrid(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();
    // Ambient radial glow
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.5);
    grad.addColorStop(0, theme.bgGlow);
    grad.addColorStop(0.7, theme.bgGlow);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.3, cy);
    ctx.lineTo(cx + r * 1.3, cy);
    ctx.moveTo(cx, cy - r * 1.3);
    ctx.lineTo(cx, cy + r * 1.3);
    ctx.stroke();

    ctx.restore();
  }

  private drawOuterReticles(
    ctx: CanvasRenderingContext2D,
    r: number,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();

    // 4 Corner Brackets
    const bracketSize = r * 1.18;
    const cornerArm = 24;
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

    // Outer segmented perimeter ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  private drawTelemetryRings(
    ctx: CanvasRenderingContext2D,
    r: number,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();

    // Ring 1: High-speed counter-clockwise ring with azimuth notches
    ctx.save();
    ctx.rotate(-this.time * 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([16, 28, 4, 12]);
    ctx.stroke();

    // Azimuth ticks (72 ticks)
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

    // Ring 2: Clockwise primary ring with precision sector arcs
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

    // Ring 3: Segmented hex brackets
    ctx.save();
    ctx.rotate(-this.time * 0.3);
    for (let i = 0; i < 4; i++) {
      const startAngle = (i * Math.PI) / 2 + 0.1;
      const endAngle = startAngle + Math.PI / 2 - 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, startAngle, endAngle);
      ctx.strokeStyle = theme.secondary;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  private drawRadialSpectrum(
    ctx: CanvasRenderingContext2D,
    r: number,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();
    ctx.rotate(this.time * 0.2);

    const count = this.audioSpectrum.length;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const amp = this.audioSpectrum[i];
      const barLen = amp * 18;

      const r1 = r;
      const r2 = r + barLen;

      const x1 = Math.cos(angle) * r1;
      const y1 = Math.sin(angle) * r1;
      const x2 = Math.cos(angle) * r2;
      const y2 = Math.sin(angle) * r2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.accent;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawArcReactor(
    ctx: CanvasRenderingContext2D,
    r: number,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();

    // 1. Outer reactor rim
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = "#060a0f";
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.stroke();

    // 2. 10 Rotating Copper Electromagnets
    ctx.save();
    ctx.rotate(this.time * 0.5);
    const coilCount = 10;
    for (let i = 0; i < coilCount; i++) {
      const angle = (i * Math.PI * 2) / coilCount;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(r * 0.75, 0);

      ctx.fillStyle = "#b45309"; // Copper/Gold
      ctx.fillRect(-4, -6, 8, 12);

      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -6, 8, 12);

      ctx.restore();
    }
    ctx.restore();

    // 3. Central Plasma Core (Glowing nuclear singularity)
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

    // 4. Triangular Arc Reactor Core Emblem
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

  private drawTargetReticle(
    ctx: CanvasRenderingContext2D,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();
    // Micro reticle in center
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  private drawDiagnosticsHUD(
    ctx: CanvasRenderingContext2D,
    theme: typeof JARVIS_THEMES["cyan"]
  ): void {
    ctx.save();
    ctx.font = "10.5px SF Mono, monospace";
    ctx.fillStyle = theme.primary;
    ctx.textBaseline = "top";

    const isOverdrive = this.options.overdrive;

    // Top-Left Telemetry
    ctx.fillText("J.A.R.V.I.S. // MARK LXXXV", 22, 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(`CORE TEMP: ${this.coreTemp} K`, 22, 40);
    ctx.fillText(`FLUX OUTPUT: ${this.fluxLevel}%`, 22, 56);
    ctx.fillText(`ORAZAKA NEURAL LINK: CONNECTED`, 22, 72);

    // Top-Right Status
    ctx.textAlign = "right";
    ctx.fillStyle = isOverdrive ? "#ef4444" : theme.primary;
    ctx.fillText(isOverdrive ? "OVERDRIVE // WARNING" : "SYSTEM: OPTIMAL", this.width - 22, 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(`TILT X: ${(this.currentTiltX * 57.3).toFixed(1)}°`, this.width - 22, 40);
    ctx.fillText(`TILT Y: ${(this.currentTiltY * 57.3).toFixed(1)}°`, this.width - 22, 56);
    ctx.fillText(`AUDIO FORMANT: ACTIVE`, this.width - 22, 72);

    // Bottom Status Bar
    ctx.textAlign = "center";
    ctx.fillStyle = theme.secondary;
    ctx.fillText(
      isOverdrive
        ? "CRITICAL PLASMA SATURATION · PROTOCOL 11 ENGAGED"
        : "AUTONOMOUS QUANTUM CORE · ECOSYSTEM KRIZAKA",
      this.width / 2,
      this.height - 24
    );

    ctx.restore();
  }
}
