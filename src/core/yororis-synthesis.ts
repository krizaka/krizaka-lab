/**
 * @krizaka/motion — Yororis Acoustic Voice & Harmonic Presence Engine (V2 Next-Level)
 * Multi-layer acoustic nebula, facial empathy aura, bioluminescent spore cloud,
 * voice formant ribbons, and real-time microphone frequency analysis.
 * 100% self-contained in krizaka-motion.
 */

import { YororisState, Point3D, Point2D } from "./types";
import { PRODUCT_BRANDS } from "./color-palettes";

export type YororisVoiceTone = "lea" | "theta" | "solfeggio" | "aurora";

export interface YororisAcousticOptions {
  state?: YororisState;
  voiceTone?: YororisVoiceTone;
  interactive?: boolean;
  intensity?: number;
  showRings?: boolean;
  showSpores?: boolean;
  showAuraFace?: boolean;
  audioReactive?: boolean;
}

interface SporeParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  hueOffset: number;
}

export class YororisAcousticRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: YororisAcousticOptions;
  private width = 500;
  private height = 500;
  private dpr = 1;

  private state: YororisState = "idle";
  private time = 0;

  // 3D Sphere geometry
  private spherePoints: Point3D[] = [];
  private baseRadius = 80;

  // Bioluminescent spore cloud
  private spores: SporeParticle[] = [];

  // Audio synthesis & real-time mic analysis
  private frequencies: number[] = new Array(36).fill(0);
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isAudioRunning = false;

  // Real microphone analysis
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micDataArray: Uint8Array | null = null;
  private isMicActive = false;

  // Cursor focus for facial empathy
  private mousePos: Point2D = { x: -1000, y: -1000 };
  private gazeOffset: Point2D = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, options: YororisAcousticOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;

    this.options = {
      state: "idle",
      voiceTone: "lea",
      interactive: true,
      intensity: 1.0,
      showRings: true,
      showSpores: true,
      showAuraFace: true,
      audioReactive: false,
      ...options,
    };
    this.state = this.options.state || "idle";

    this.initSphereGeometry();
    this.initSpores();
    this.initLayout(canvas.clientWidth || 500, canvas.clientHeight || 500, window.devicePixelRatio || 1);
    this.setupEvents();
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
    const latCount = 20;
    const lonCount = 32;
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

  private initSpores(): void {
    const count = 48;
    this.spores = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.8 + Math.random() * 1.5;
      this.spores.push({
        x: Math.cos(angle) * dist,
        y: (Math.random() - 0.5) * 1.8,
        z: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        vz: (Math.random() - 0.5) * 0.08,
        size: 1.2 + Math.random() * 2.0,
        alpha: 0.2 + Math.random() * 0.6,
        hueOffset: Math.random() * 20,
      });
    }
  }

  private setupEvents(): void {
    if (!this.options.interactive) return;

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mousePos = { x: -1000, y: -1000 };
    });
  }

  /** Connects to the user's real microphone */
  public async toggleMicrophone(enable?: boolean): Promise<boolean> {
    if (enable === false || (enable === undefined && this.isMicActive)) {
      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
        this.micStream = null;
      }
      this.micAnalyser = null;
      this.micDataArray = null;
      this.isMicActive = false;
      return false;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      this.micAnalyser = analyser;
      this.micDataArray = new Uint8Array(analyser.frequencyBinCount);
      this.isMicActive = true;
      this.setState("listening");
      return true;
    } catch {
      this.isMicActive = false;
      return false;
    }
  }

  /** Starts procedural soothing drone synthesis */
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

      const tone = this.options.voiceTone || "lea";
      let baseFreq = 216; // Léa tone
      if (tone === "theta") baseFreq = 108;
      else if (tone === "solfeggio") baseFreq = 432;
      else if (tone === "aurora") baseFreq = 288;

      this.oscillator.type = "sine";
      this.oscillator.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.07, this.audioCtx.currentTime + 1.4);

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

    this.updateAcousticSpectrum(deltaTime);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    // Smooth gaze tracking toward cursor
    if (this.mousePos.x > 0 && this.mousePos.y > 0) {
      const targetGazeX = ((this.mousePos.x - cx) / (this.width / 2)) * 14;
      const targetGazeY = ((this.mousePos.y - cy) / (this.height / 2)) * 14;
      this.gazeOffset.x += (targetGazeX - this.gazeOffset.x) * Math.min(deltaTime * 5, 0.3);
      this.gazeOffset.y += (targetGazeY - this.gazeOffset.y) * Math.min(deltaTime * 5, 0.3);
    } else {
      this.gazeOffset.x += (0 - this.gazeOffset.x) * Math.min(deltaTime * 3, 0.2);
      this.gazeOffset.y += (0 - this.gazeOffset.y) * Math.min(deltaTime * 3, 0.2);
    }

    // 1. Draw outer therapeutic ambient aura
    this.drawAmbientAura(ctx, cx, cy);

    // 2. Draw undulating voice wave ribbons
    if (this.options.showRings) {
      this.drawVoiceWaveRibbons(ctx, cx, cy);
    }

    // 3. Draw orbiting bioluminescent spore cloud
    if (this.options.showSpores) {
      this.drawSporeCloud(ctx, cx, cy, deltaTime);
    }

    // 4. Draw 3D harmonic sphere with vertex displacement
    this.drawHarmonicSphere(ctx, cx, cy, deltaTime);

    // 5. Draw facial empathy focus nodes (Léa's presence eyes)
    if (this.options.showAuraFace) {
      this.drawEmpathyFace(ctx, cx, cy);
    }

    // 6. Draw therapeutic mindfulness HUD label
    this.drawStateHUD(ctx, cx, cy);

    ctx.restore();
  }

  private updateAcousticSpectrum(deltaTime: number): void {
    if (this.isMicActive && this.micAnalyser && this.micDataArray) {
      this.micAnalyser.getByteFrequencyData(this.micDataArray as Uint8Array<ArrayBuffer>);
      for (let i = 0; i < this.frequencies.length; i++) {
        const val = (this.micDataArray[i] || 0) / 255;
        this.frequencies[i] += (val - this.frequencies[i]) * Math.min(deltaTime * 18, 0.5);
      }
      return;
    }

    const isSpeaking = this.state === "speaking";
    const isListening = this.state === "listening";

    for (let i = 0; i < this.frequencies.length; i++) {
      let target = 0;
      if (isSpeaking) {
        const f1 = Math.exp(-Math.pow(i - 8, 2) / 10) * 0.95;
        const f2 = Math.exp(-Math.pow(i - 20, 2) / 14) * 0.7;
        const voiceJitter = Math.sin(this.time * 9 + i * 0.6) * 0.2;
        target = Math.max(0, f1 + f2 + voiceJitter);
      } else if (isListening) {
        target = 0.16 + Math.sin(this.time * 4.5 + i * 0.5) * 0.14;
      } else {
        target = 0.08 + Math.sin(this.time * 1.6 + i * 0.2) * 0.05;
      }
      this.frequencies[i] += (target - this.frequencies[i]) * Math.min(deltaTime * 12, 0.4);
    }
  }

  private drawAmbientAura(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const brand = PRODUCT_BRANDS.yororis;
    const breath = Math.sin(this.time * 0.9) * 0.12;
    const radius = this.baseRadius * (1.9 + breath);

    const auraGrad = ctx.createRadialGradient(cx, cy, this.baseRadius * 0.35, cx, cy, radius);
    if (this.state === "resting") {
      auraGrad.addColorStop(0, "rgba(216, 227, 220, 0.3)");
      auraGrad.addColorStop(0.55, "rgba(124, 144, 130, 0.14)");
      auraGrad.addColorStop(1, "rgba(124, 144, 130, 0)");
    } else if (this.state === "speaking") {
      auraGrad.addColorStop(0, "rgba(163, 184, 153, 0.38)");
      auraGrad.addColorStop(0.65, "rgba(124, 144, 130, 0.16)");
      auraGrad.addColorStop(1, "rgba(124, 144, 130, 0)");
    } else {
      auraGrad.addColorStop(0, "rgba(124, 144, 130, 0.22)");
      auraGrad.addColorStop(0.8, "rgba(124, 144, 130, 0.05)");
      auraGrad.addColorStop(1, "rgba(124, 144, 130, 0)");
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();
    ctx.restore();
  }

  private drawVoiceWaveRibbons(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const brand = PRODUCT_BRANDS.yororis;
    const ribbonCount = 3;

    ctx.save();
    for (let r = 0; r < ribbonCount; r++) {
      const speed = this.state === "speaking" ? 1.6 : 0.8;
      const progress = ((this.time * speed + r * 0.8) % 2.8) / 2.8;
      const currentR = this.baseRadius + progress * (this.baseRadius * 1.5);
      const alpha = Math.max(0, (1 - progress) * 0.45);

      ctx.beginPath();
      const points = 48;
      for (let i = 0; i <= points; i++) {
        const angle = (i * Math.PI * 2) / points;
        const wave = Math.sin(angle * 6 + this.time * 3 + r) * (6 * (1 - progress));
        const px = cx + Math.cos(angle) * (currentR + wave);
        const py = cy + Math.sin(angle) * (currentR + wave);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = brand.secondary;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSporeCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, dt: number): void {
    const brand = PRODUCT_BRANDS.yororis;

    ctx.save();
    for (const sp of this.spores) {
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.z += sp.vz * dt;

      // Orbiting gyre
      const rot = dt * 0.4;
      const nx = sp.x * Math.cos(rot) - sp.z * Math.sin(rot);
      const nz = sp.z * Math.cos(rot) + sp.x * Math.sin(rot);
      sp.x = nx;
      sp.z = nz;

      // Rebound inside bounding shell
      const dist = Math.sqrt(sp.x * sp.x + sp.y * sp.y + sp.z * sp.z);
      if (dist > 2.2 || dist < 0.7) {
        sp.vx *= -1;
        sp.vy *= -1;
        sp.vz *= -1;
      }

      const fov = 300;
      // Never behind the camera: a negative depth gave a negative radius (a console error every frame on a wide stage).
      const scale = fov / Math.max(40, fov + sp.z * this.baseRadius);
      const px = cx + sp.x * this.baseRadius * scale;
      const py = cy + sp.y * this.baseRadius * scale;

      const alpha = Math.max(0.08, Math.min(1.0, (sp.z + 1.5) / 3)) * sp.alpha;

      ctx.beginPath();
      ctx.arc(px, py, sp.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = sp.z > 0 ? brand.secondary : brand.primary;
      ctx.globalAlpha = alpha;
      ctx.fill();
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

    const rotY = this.time * 0.28;
    const rotX = Math.sin(this.time * 0.16) * 0.32;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    let scaleModifier = 1.0;
    if (this.state === "resting") {
      // A slow, quiet swell: the sphere at rest, waiting for a voice (no exercise, no count).
      scaleModifier = 1.0 + Math.sin(this.time * 0.7) * 0.05;
    } else {
      scaleModifier = 1.0 + Math.sin(this.time * 1.3) * 0.06;
    }

    const currentRadius = this.baseRadius * scaleModifier;

    ctx.save();
    for (let i = 0; i < this.spherePoints.length; i++) {
      const pt = this.spherePoints[i];

      const freqIdx = Math.floor(Math.abs(pt.y) * (this.frequencies.length - 1));
      const freqAmp = this.frequencies[freqIdx] || 0.1;

      const harmonicNoise =
        Math.sin(pt.x * 4.2 + this.time * 2.2) *
        Math.cos(pt.y * 4.2 + this.time * 1.9) *
        Math.sin(pt.z * 4.2 + this.time * 2.4);

      const displacement = 1.0 + freqAmp * 0.3 + harmonicNoise * 0.08;
      const r = currentRadius * displacement;

      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.z * cosY + pt.x * sinY;

      const y2 = pt.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + pt.y * sinX;

      const fov = 350;
      const pScale = fov / (fov + z2 * r);
      const projX = cx + x1 * r * pScale;
      const projY = cy + y2 * r * pScale;

      const depthAlpha = Math.max(0.08, Math.min(1.0, (z2 + 1) / 2));
      const pointSize = Math.max(1, 1.8 * pScale * (1 + freqAmp * 0.8));

      ctx.beginPath();
      ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
      ctx.fillStyle = z2 > 0 ? brand.secondary : brand.primary;
      ctx.globalAlpha = depthAlpha * 0.78;
      ctx.fill();
    }

    ctx.restore();
  }

  private drawEmpathyFace(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const brand = PRODUCT_BRANDS.yororis;

    // Two subtle luminous focus nodes representing Léa's gentle eyes / empathetic gaze
    const eyeSpacing = this.baseRadius * 0.45;
    const eyeY = cy - this.baseRadius * 0.15 + this.gazeOffset.y;

    const eyeL = cx - eyeSpacing / 2 + this.gazeOffset.x;
    const eyeR = cx + eyeSpacing / 2 + this.gazeOffset.x;

    const blink = Math.sin(this.time * 0.4) > 0.96 ? 0.2 : 1.0;
    const eyeRSize = 3.5 * blink;

    ctx.save();
    for (const ex of [eyeL, eyeR]) {
      // Glow halo
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRSize * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(216, 227, 220, 0.25)";
      ctx.fill();

      // Eye node
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeRSize, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = brand.secondary;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }

  private drawStateHUD(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.font = "11px SF Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let label = "LISTENING";
    if (this.isMicActive) {
      label = "MICROPHONE ON · LISTENING";
    } else if (this.state === "speaking") {
      label = "SPEAKING";
    } else if (this.state === "resting") {
      label = "AT REST";
    } else if (this.state === "reflecting") {
      label = "REFLECTING";
    }

    ctx.fillStyle = "rgba(184, 197, 185, 0.8)";
    ctx.fillText(label, cx, this.height - 22);

    ctx.restore();
  }
}
