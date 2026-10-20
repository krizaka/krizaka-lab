/**
 * @krizaka/motion — Yororis Acoustic Voice & Harmonic Presence Engine
 * Generative 3D voice sphere and therapeutic acoustic synthesis for dev.yororis.com
 * 100% self-contained in krizaka-motion.
 */

import { YororisState, Point3D } from "./types";
import { PRODUCT_BRANDS } from "./color-palettes";

export interface YororisAcousticOptions {
  state?: YororisState;
  interactive?: boolean;
  intensity?: number;
  showRings?: boolean;
  audioReactive?: boolean;
}

export class YororisAcousticRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: YororisAcousticOptions;
  private width = 400;
  private height = 400;
  private dpr = 1;

  private state: YororisState = "idle";
  private time = 0;
  private breathingTimer = 0; // 0 to 19s (4s inhale, 7s hold, 8s exhale)

  // 3D Sphere geometry (rings of latitude and longitude points)
  private spherePoints: Point3D[] = [];
  private baseRadius = 70;

  // Audio synthesis & frequency spectrum
  private frequencies: number[] = new Array(32).fill(0);
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isAudioRunning = false;

  constructor(canvas: HTMLCanvasElement, options: YororisAcousticOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;
    this.options = {
      state: "idle",
      interactive: true,
      intensity: 1.0,
      showRings: true,
      audioReactive: false,
      ...options,
    };
    this.state = this.options.state || "idle";

    this.initSphereGeometry();
    this.initLayout(canvas.clientWidth || 400, canvas.clientHeight || 400, window.devicePixelRatio || 1);
  }

  public setOptions(options: Partial<YororisAcousticOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.state) {
      this.state = options.state;
    }
  }

  public setState(state: YororisState): void {
    this.state = state;
    this.options.state = state;
  }

  public setDimensions(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.baseRadius = Math.min(width, height) * 0.22;
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.baseRadius = Math.min(w, h) * 0.22;
  }

  private initSphereGeometry(): void {
    const latCount = 18;
    const lonCount = 28;
    this.spherePoints = [];

    for (let i = 0; i <= latCount; i++) {
      const theta = (i * Math.PI) / latCount;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let j = 0; j <= lonCount; j++) {
        const phi = (j * 2 * Math.PI) / lonCount;
        const x = sinTheta * Math.cos(phi);
        const y = cosTheta;
        const z = sinTheta * Math.sin(phi);

        this.spherePoints.push({ x, y, z });
      }
    }
  }

  /** Starts a soothing procedurally generated acoustic harmonic drone */
  public toggleProceduralAudio(enable?: boolean): boolean {
    if (typeof window === "undefined") return false;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (enable === false || (enable === undefined && this.isAudioRunning)) {
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx?.currentTime || 0, 0.2);
      }
      setTimeout(() => {
        this.oscillator?.stop();
        this.oscillator?.disconnect();
        this.audioCtx?.close();
        this.audioCtx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isAudioRunning = false;
      }, 250);
      return false;
    }

    try {
      this.audioCtx = new AudioContextClass();
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      // Gentle vocal harmonic frequency (Léa's tone ~ 216Hz, warm soothing resonance)
      this.oscillator.type = "sine";
      this.oscillator.frequency.setValueAtTime(216, this.audioCtx.currentTime);

      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.audioCtx.currentTime + 1.2);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();
      this.isAudioRunning = true;
      return true;
    } catch {
      return false;
    }
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime;
    const ctx = this.ctx;
    const dpr = this.dpr;

    // Advance 4-7-8 breathing timer (19s cycle)
    this.breathingTimer = (this.breathingTimer + deltaTime) % 19;

    // Update procedural acoustic frequency spectrum
    this.updateAcousticSpectrum(deltaTime);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    // 1. Draw outer therapeutic ambient aura
    this.drawAmbientAura(ctx, cx, cy);

    // 2. Draw acoustic radiating rings / voice waves
    if (this.options.showRings) {
      this.drawVoiceWaveRings(ctx, cx, cy);
    }

    // 3. Draw 3D harmonic sphere with dynamic vertex displacement
    this.drawHarmonicSphere(ctx, cx, cy, deltaTime);

    // 4. Draw mindful breathing pacer label / indicator if in breathing mode
    this.drawStateHUD(ctx, cx, cy);

    ctx.restore();
  }

  private updateAcousticSpectrum(deltaTime: number): void {
    const isSpeaking = this.state === "speaking";
    const isListening = this.state === "listening";

    for (let i = 0; i < this.frequencies.length; i++) {
      let target = 0;
      if (isSpeaking) {
        // Formant vocal curve
        const formant1 = Math.exp(-Math.pow(i - 6, 2) / 8) * 0.9;
        const formant2 = Math.exp(-Math.pow(i - 16, 2) / 12) * 0.65;
        const noise = Math.sin(this.time * 8 + i) * 0.2;
        target = Math.max(0, formant1 + formant2 + noise);
      } else if (isListening) {
        // Sensitive listening ripples
        target = 0.15 + Math.sin(this.time * 4 + i * 0.5) * 0.12;
      } else {
        // Gentle resting breathing fluctuation
        target = 0.08 + Math.sin(this.time * 1.5 + i * 0.2) * 0.05;
      }
      this.frequencies[i] += (target - this.frequencies[i]) * Math.min(deltaTime * 10, 0.4);
    }
  }

  private drawAmbientAura(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const brand = PRODUCT_BRANDS.yororis;
    const breath = Math.sin(this.time * 0.8) * 0.1;
    const radius = this.baseRadius * (1.8 + breath);

    const auraGrad = ctx.createRadialGradient(cx, cy, this.baseRadius * 0.4, cx, cy, radius);
    if (this.state === "breathing") {
      auraGrad.addColorStop(0, "rgba(184, 197, 185, 0.28)");
      auraGrad.addColorStop(0.6, "rgba(124, 144, 130, 0.12)");
      auraGrad.addColorStop(1, "rgba(124, 144, 130, 0)");
    } else if (this.state === "speaking") {
      auraGrad.addColorStop(0, "rgba(124, 144, 130, 0.35)");
      auraGrad.addColorStop(0.7, "rgba(93, 137, 77, 0.14)");
      auraGrad.addColorStop(1, "rgba(93, 137, 77, 0)");
    } else {
      auraGrad.addColorStop(0, "rgba(124, 144, 130, 0.2)");
      auraGrad.addColorStop(0.8, "rgba(124, 144, 130, 0.04)");
      auraGrad.addColorStop(1, "rgba(124, 144, 130, 0)");
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();
    ctx.restore();
  }

  private drawVoiceWaveRings(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const brand = PRODUCT_BRANDS.yororis;
    const ringCount = 3;

    ctx.save();
    for (let i = 0; i < ringCount; i++) {
      const speed = this.state === "speaking" ? 1.4 : 0.6;
      const progress = ((this.time * speed + i * 0.7) % 2.5) / 2.5;
      const r = this.baseRadius + progress * (this.baseRadius * 1.4);
      const alpha = Math.max(0, (1 - progress) * 0.4);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = brand.secondary;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = this.time * 12;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHarmonicSphere(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    deltaTime: number
  ): void {
    const brand = PRODUCT_BRANDS.yororis;

    // 3D rotation angles
    const rotY = this.time * 0.25;
    const rotX = Math.sin(this.time * 0.15) * 0.3;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Calculate breathing scale factor
    let scaleModifier = 1.0;
    if (this.state === "breathing") {
      // 4s inhale, 7s hold, 8s exhale
      if (this.breathingTimer < 4) {
        scaleModifier = 0.9 + (this.breathingTimer / 4) * 0.3;
      } else if (this.breathingTimer < 11) {
        scaleModifier = 1.2;
      } else {
        const exh = (this.breathingTimer - 11) / 8;
        scaleModifier = 1.2 - exh * 0.3;
      }
    } else {
      scaleModifier = 1.0 + Math.sin(this.time * 1.2) * 0.05;
    }

    const currentRadius = this.baseRadius * scaleModifier;

    ctx.save();

    // Project and render vertices
    for (let i = 0; i < this.spherePoints.length; i++) {
      const pt = this.spherePoints[i];

      // Harmonic acoustic displacement based on frequencies & Perlin-like 3D harmonic noise
      const freqIdx = Math.floor(Math.abs(pt.y) * (this.frequencies.length - 1));
      const freqAmp = this.frequencies[freqIdx] || 0.1;

      const harmonicNoise =
        Math.sin(pt.x * 4 + this.time * 2) *
        Math.cos(pt.y * 4 + this.time * 1.8) *
        Math.sin(pt.z * 4 + this.time * 2.2);

      const displacement = 1.0 + freqAmp * 0.28 + harmonicNoise * 0.08;
      const r = currentRadius * displacement;

      // 3D Rotation Y
      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.z * cosY + pt.x * sinY;

      // 3D Rotation X
      const y2 = pt.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + pt.y * sinX;

      // Perspective projection
      const fov = 350;
      const pScale = fov / (fov + z2 * r);
      const projX = cx + x1 * r * pScale;
      const projY = cy + y2 * r * pScale;

      // Lighting / depth shading (points facing front are brighter)
      const depthAlpha = Math.max(0.08, Math.min(1.0, (z2 + 1) / 2));
      const pointSize = Math.max(1, 1.8 * pScale * (1 + freqAmp * 0.8));

      ctx.beginPath();
      ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
      ctx.fillStyle = z2 > 0 ? brand.secondary : brand.primary;
      ctx.globalAlpha = depthAlpha * 0.75;
      ctx.fill();
    }

    // Central tranquil core nucleus
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(124, 144, 130, 0.15)";
    ctx.strokeStyle = brand.secondary;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fill();

    ctx.restore();
  }

  private drawStateHUD(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.font = "11px SF Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let label = "YORORIS · ECOUTE ACTIVE";
    if (this.state === "speaking") {
      label = "YORORIS · PRESENCE VOCALE (LÉA)";
    } else if (this.state === "breathing") {
      let breathPhase = "INSPIRER (4s)";
      if (this.breathingTimer >= 4 && this.breathingTimer < 11) {
        breathPhase = "RETENIR (7s)";
      } else if (this.breathingTimer >= 11) {
        breathPhase = "EXPIRER (8s)";
      }
      label = `PACER 4-7-8 · ${breathPhase}`;
    } else if (this.state === "reflecting") {
      label = "YORORIS · REFLEXION CLINIQUEMENT ENCADREE";
    }

    ctx.fillStyle = "rgba(184, 197, 185, 0.75)";
    ctx.fillText(label, cx, this.height - 20);

    ctx.restore();
  }
}
