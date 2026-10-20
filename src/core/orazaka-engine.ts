/**
 * @krizaka/motion — Orazaka Engine Canvas & Particle System
 * Next-level responsive neural pipeline simulation connecting all Krizaka products.
 * 100% self-contained in krizaka-motion.
 */

import { ProductId, ProductSourceNode, Particle } from "./types";
import { PRODUCT_BRANDS } from "./color-palettes";

const PRODUCT_LIST: ProductId[] = [
  "yomizaka",
  "orochia",
  "kachizaka",
  "akinaza",
  "yasakia",
  "yororis",
];

export interface OrazakaEngineOptions {
  interactive?: boolean;
  showTelemetry?: boolean;
  particleDensity?: number; // 0.5 to 2.0
  speedMultiplier?: number;
  highlightedSource?: ProductId | null;
  onSelectSource?: (sourceId: ProductId | null) => void;
}

export class OrazakaEngineRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: OrazakaEngineOptions;
  private width = 400;
  private height = 200;
  private dpr = 1;

  private sources: ProductSourceNode[] = [];
  private coreX = 0;
  private coreY = 0;
  private coreRadius = 26;
  private corePulse = 0;
  private shockwaves: Array<{ radius: number; maxRadius: number; alpha: number; color: string }> = [];

  private particles: Particle[] = [];
  private nextParticleId = 0;
  private mouseX = -1000;
  private mouseY = -1000;
  private isHovered = false;
  private hoveredSourceId: ProductId | null = null;

  private time = 0;
  private totalRequests = 1420;

  constructor(canvas: HTMLCanvasElement, options: OrazakaEngineOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;
    this.options = {
      interactive: true,
      showTelemetry: true,
      particleDensity: 1.0,
      speedMultiplier: 1.0,
      ...options,
    };

    this.initLayout(canvas.clientWidth || 400, canvas.clientHeight || 200, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<OrazakaEngineOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public setDimensions(width: number, height: number, dpr: number): void {
    this.initLayout(width, height, dpr);
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;

    const isCompact = w < 480;

    // Layout source nodes on the left side
    const sourceX = isCompact ? 28 : Math.max(34, w * 0.08);
    const topMargin = isCompact ? 16 : 22;
    const bottomMargin = isCompact ? 16 : 22;
    const availableHeight = h - topMargin - bottomMargin;
    const stepY = availableHeight / (PRODUCT_LIST.length - 1);

    this.sources = PRODUCT_LIST.map((id, index) => {
      const brand = PRODUCT_BRANDS[id];
      return {
        id,
        name: brand.name,
        x: sourceX,
        y: topMargin + index * stepY,
        color: brand.primary,
        accent: brand.secondary,
        status: "streaming",
        packetRate: 1.2 + Math.sin(index) * 0.4,
        activeRequests: 12 + Math.floor(Math.random() * 25),
      };
    });

    // Orazaka core on the right
    this.coreX = isCompact ? w - 36 : w - Math.max(50, w * 0.12);
    this.coreY = h / 2;
    this.coreRadius = isCompact ? 20 : 28;
  }

  private setupEvents(): void {
    if (!this.options.interactive) return;

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isHovered = true;

      // Check if hovering over a source node
      let found: ProductId | null = null;
      for (const src of this.sources) {
        const dx = this.mouseX - src.x;
        const dy = this.mouseY - src.y;
        if (dx * dx + dy * dy < 20 * 20) {
          found = src.id;
          break;
        }
      }
      this.hoveredSourceId = found;
      if (this.options.onSelectSource) {
        this.options.onSelectSource(found);
      }
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
      this.isHovered = false;
      this.hoveredSourceId = null;
      if (this.options.onSelectSource) {
        this.options.onSelectSource(null);
      }
    });
  }

  public emitPacket(sourceIndex: number): void {
    const src = this.sources[sourceIndex];
    if (!src) return;

    const brand = PRODUCT_BRANDS[src.id];
    const speed = (0.28 + Math.random() * 0.18) * (this.options.speedMultiplier || 1);

    this.particles.push({
      id: this.nextParticleId++,
      sourceId: src.id,
      x: src.x,
      y: src.y,
      vx: 0,
      vy: 0,
      progress: 0,
      speed,
      size: 2.2 + Math.random() * 1.8,
      alpha: 0.9,
      color: brand.primary,
      glowColor: brand.glow,
      dataPayload: {
        requestId: `req_${Math.random().toString(16).substring(2, 7)}`,
        latencyMs: Math.round(6 + Math.random() * 12),
        tokens: Math.round(180 + Math.random() * 400),
      },
    });
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime;
    const ctx = this.ctx;
    const dpr = this.dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw connecting neural pathways (Cubic Bezier curves)
    this.drawConduits(ctx);

    // 2. Spawn and update particles
    this.updateParticles(deltaTime);

    // 3. Draw particles with bloom / glow
    this.drawParticles(ctx);

    // 4. Update and draw Orazaka Core reactor
    this.drawCore(ctx, deltaTime);

    // 5. Draw Product Source Nodes
    this.drawSources(ctx);

    // 6. Draw telemetry overlay if enabled
    if (this.options.showTelemetry) {
      this.drawTelemetryOverlay(ctx);
    }

    ctx.restore();
  }

  private drawConduits(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;

    for (let i = 0; i < this.sources.length; i++) {
      const src = this.sources[i];
      const isTargeted = activeTarget === src.id;
      const isDimmed = activeTarget !== null && !isTargeted;

      const p0 = { x: src.x + 8, y: src.y };
      const p3 = { x: this.coreX - this.coreRadius * 0.8, y: this.coreY };

      // Bezier control points create graceful S-curve convergence
      const dx = p3.x - p0.x;
      const p1 = { x: p0.x + dx * 0.45, y: p0.y };
      const p2 = { x: p0.x + dx * 0.75, y: p3.y + (src.y - this.coreY) * 0.15 };

      // Background conduit trace (ambient filament)
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

      ctx.lineWidth = isTargeted ? 2.4 : 1.2;
      ctx.strokeStyle = isTargeted
        ? src.color
        : isDimmed
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(249, 115, 22, 0.18)";
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -this.time * 24;
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle luminescence along conduit
      if (isTargeted) {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.lineWidth = 6;
        ctx.strokeStyle = src.color;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  private updateParticles(deltaTime: number): void {
    // Spawn probability per frame
    const density = this.options.particleDensity || 1.0;
    const spawnChance = 0.35 * density;

    if (Math.random() < spawnChance) {
      const randomSource = Math.floor(Math.random() * this.sources.length);
      this.emitPacket(randomSource);
    }

    // Move existing particles along Bezier curves
    const kept: Particle[] = [];
    for (const p of this.particles) {
      p.progress += p.speed * deltaTime;

      if (p.progress >= 1) {
        // Reached Orazaka core: trigger absorption shockwave
        this.corePulse = Math.min(this.corePulse + 0.18, 1.2);
        this.totalRequests++;

        if (this.shockwaves.length < 5 && Math.random() < 0.4) {
          this.shockwaves.push({
            radius: this.coreRadius * 0.8,
            maxRadius: this.coreRadius * 2.8,
            alpha: 0.65,
            color: p.color,
          });
        }
        continue;
      }

      // Calculate position along cubic bezier
      const src = this.sources.find((s) => s.id === p.sourceId);
      if (src) {
        const p0 = { x: src.x + 8, y: src.y };
        const p3 = { x: this.coreX - this.coreRadius * 0.7, y: this.coreY };
        const dx = p3.x - p0.x;
        const p1 = { x: p0.x + dx * 0.45, y: p0.y };
        const p2 = { x: p0.x + dx * 0.75, y: p3.y + (src.y - this.coreY) * 0.15 };

        const t = p.progress;
        const mt = 1 - t;
        p.x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
        p.y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;

        // Mouse magnetic attraction effect
        if (this.isHovered) {
          const dmx = this.mouseX - p.x;
          const dmy = this.mouseY - p.y;
          const distSq = dmx * dmx + dmy * dmy;
          if (distSq < 70 * 70 && distSq > 1) {
            const force = (1 - Math.sqrt(distSq) / 70) * 8;
            p.x += (dmx / Math.sqrt(distSq)) * force;
            p.y += (dmy / Math.sqrt(distSq)) * force;
          }
        }
      }

      kept.push(p);
    }
    this.particles = kept;
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;

    for (const p of this.particles) {
      const isTargeted = activeTarget === p.sourceId;
      const isDimmed = activeTarget !== null && !isTargeted;
      const alpha = isDimmed ? 0.15 : isTargeted ? 1.0 : 0.85;

      ctx.save();
      // Outer chromatic aura
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = p.glowColor;
      ctx.globalAlpha = alpha * 0.55;
      ctx.fill();

      // Core photon
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = isTargeted ? "#ffffff" : p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Tail trailing
      ctx.beginPath();
      ctx.arc(p.x - 3 * (1 - p.progress), p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();

      ctx.restore();
    }
  }

  private drawCore(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const brand = PRODUCT_BRANDS.orazaka;

    // Decay core pulse
    this.corePulse = Math.max(0, this.corePulse - deltaTime * 1.5);
    const pulseScale = 1 + this.corePulse * 0.14 + Math.sin(this.time * 3) * 0.04;
    const currentRadius = this.coreRadius * pulseScale;

    // 1. Draw shockwaves radiating outwards
    const aliveWaves: typeof this.shockwaves = [];
    for (const wave of this.shockwaves) {
      wave.radius += deltaTime * 45;
      wave.alpha -= deltaTime * 0.85;

      if (wave.alpha > 0 && wave.radius < wave.maxRadius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.coreX, this.coreY, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = Math.max(0, wave.alpha);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
        aliveWaves.push(wave);
      }
    }
    this.shockwaves = aliveWaves;

    // 2. Volumetric background bloom
    const grad = ctx.createRadialGradient(
      this.coreX,
      this.coreY,
      2,
      this.coreX,
      this.coreY,
      currentRadius * 2.5
    );
    grad.addColorStop(0, "rgba(249, 115, 22, 0.42)");
    grad.addColorStop(0.5, "rgba(249, 115, 22, 0.12)");
    grad.addColorStop(1, "rgba(249, 115, 22, 0)");

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.coreX, this.coreY, currentRadius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. Rotating energy rings around Orazaka
    ctx.save();
    ctx.translate(this.coreX, this.coreY);
    ctx.rotate(this.time * 0.8);

    // Outer orbital ring
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 1.25, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(249, 115, 22, 0.35)";
    ctx.setLineDash([8, 12]);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);

    // Orbiting quantum satellites
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + this.time * 1.2;
      const ox = Math.cos(angle) * (currentRadius * 1.25);
      const oy = Math.sin(angle) * (currentRadius * 1.25);
      ctx.beginPath();
      ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffedd5";
      ctx.shadowColor = brand.primary;
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.restore();

    // 4. Central Solid Reactor Body
    ctx.beginPath();
    ctx.arc(this.coreX, this.coreY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#120b06";
    ctx.strokeStyle = brand.primary;
    ctx.lineWidth = 2;
    ctx.shadowColor = brand.primary;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 5. Stylized Orazaka Mark (Three converging nodes)
    this.drawOrazakaMark(ctx, this.coreX, this.coreY, currentRadius * 0.55);

    ctx.restore();
  }

  private drawOrazakaMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    const brand = PRODUCT_BRANDS.orazaka;
    const r = size * 0.42;

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const nx = cx + Math.cos(angle) * (size * 0.65);
      const ny = cy + Math.sin(angle) * (size * 0.65);

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = brand.primary;
      ctx.fill();

      // Connector to center
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = brand.secondary;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // Center node
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  private drawSources(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;

    for (const src of this.sources) {
      const isTargeted = activeTarget === src.id;
      const isDimmed = activeTarget !== null && !isTargeted;

      ctx.save();
      const alpha = isDimmed ? 0.35 : 1.0;

      // Glow halo on hover
      if (isTargeted) {
        ctx.beginPath();
        ctx.arc(src.x, src.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = src.color;
        ctx.globalAlpha = 0.25;
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(src.x, src.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#0c0d0f";
      ctx.strokeStyle = isTargeted ? "#ffffff" : src.color;
      ctx.lineWidth = isTargeted ? 2.2 : 1.4;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.stroke();

      // Center glowing pip
      ctx.beginPath();
      ctx.arc(src.x, src.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = src.color;
      ctx.shadowColor = src.color;
      ctx.shadowBlur = isTargeted ? 8 : 4;
      ctx.fill();

      ctx.restore();
    }
  }

  private drawTelemetryOverlay(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;

    ctx.save();
    ctx.font = "10px SF Mono, monospace";
    ctx.textBaseline = "middle";

    if (activeTarget) {
      const src = this.sources.find((s) => s.id === activeTarget);
      if (src) {
        // Source info chip
        const text = `${src.name.toUpperCase()} → ORAZAKA · 12ms · 99.8%`;
        ctx.fillStyle = "rgba(12, 13, 15, 0.85)";
        ctx.strokeStyle = src.color;
        ctx.lineWidth = 1;
        const textW = ctx.measureText(text).width;
        ctx.roundRect(this.width / 2 - textW / 2 - 8, this.height - 24, textW + 16, 18, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = src.accent;
        ctx.fillText(text, this.width / 2 - textW / 2, this.height - 15);
      }
    } else {
      // Compact overall stream stats
      ctx.fillStyle = "rgba(249, 115, 22, 0.65)";
      const stats = `PIPELINE ACTIVE · ${this.totalRequests} REQ · 6 STREAMS`;
      ctx.fillText(stats, 12, this.height - 10);
    }

    ctx.restore();
  }
}
