/**
 * @krizaka/motion — Orazaka Engine Canvas & Particle System (V2 Next-Level)
 * Supports multiple flow directions, bi-directional routing, customizable vector icons,
 * custom text labels, particle styles, and individual node inspection.
 * 100% self-contained in krizaka-lab.
 */

import {
  ProductId,
  ProductSourceNode,
  Particle,
  FlowDirection,
  FlowMode,
  ParticleStyle,
  ConduitStyle,
  IconType,
  Point2D,
} from "./types";
import { PRODUCT_BRANDS } from "./color-palettes";

const DEFAULT_PRODUCTS: Array<{ id: ProductId; name: string; subtitle: string; icon: IconType }> = [
  { id: "yomizaka", name: "Yomizaka", subtitle: "Doc AI", icon: "doc" },
  { id: "akinaza", name: "Akinaza", subtitle: "Fiscal/Agenda", icon: "calendar" },
];

export interface OrazakaEngineOptions {
  direction?: FlowDirection;
  flowMode?: FlowMode;
  particleStyle?: ParticleStyle;
  conduitStyle?: ConduitStyle;
  interactive?: boolean;
  showTelemetry?: boolean;
  showLabels?: boolean;
  particleDensity?: number;
  speedMultiplier?: number;
  highlightedSource?: ProductId | null;
  nodeConfigs?: Partial<Record<ProductId, Partial<ProductSourceNode>>>;
  onSelectSource?: (sourceId: ProductId | null) => void;
  onNodeClick?: (node: ProductSourceNode) => void;
}

export class OrazakaEngineRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: OrazakaEngineOptions;
  private width = 600;
  private height = 350;
  private dpr = 1;

  private sources: ProductSourceNode[] = [];
  private coreX = 0;
  private coreY = 0;
  private coreRadius = 28;
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
      direction: "left-to-right",
      flowMode: "inbound",
      particleStyle: "photons",
      conduitStyle: "smooth-bezier",
      interactive: true,
      showTelemetry: true,
      showLabels: true,
      particleDensity: 1.0,
      speedMultiplier: 1.0,
      ...options,
    };

    this.initLayout(canvas.clientWidth || 600, canvas.clientHeight || 350, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<OrazakaEngineOptions>): void {
    const directionChanged = options.direction && options.direction !== this.options.direction;
    this.options = { ...this.options, ...options };

    if (directionChanged || options.nodeConfigs) {
      this.initLayout(this.width, this.height, this.dpr);
    }
  }

  public setDimensions(width: number, height: number, dpr: number): void {
    this.initLayout(width, height, dpr);
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;

    const dir = this.options.direction || "left-to-right";
    const nodeCount = DEFAULT_PRODUCTS.length;

    // Build or update source nodes
    this.sources = DEFAULT_PRODUCTS.map((def, index) => {
      const brand = PRODUCT_BRANDS[def.id];
      const custom = this.options.nodeConfigs?.[def.id];

      let x = 0;
      let y = 0;

      if (dir === "left-to-right") {
        const sourceX = Math.max(48, w * 0.12);
        const topMargin = 30;
        const availableHeight = h - topMargin * 2;
        const stepY = availableHeight / (nodeCount - 1);

        x = sourceX;
        y = topMargin + index * stepY;
        this.coreX = w - Math.max(54, w * 0.14);
        this.coreY = h / 2;
      } else if (dir === "right-to-left") {
        const sourceX = w - Math.max(48, w * 0.12);
        const topMargin = 30;
        const availableHeight = h - topMargin * 2;
        const stepY = availableHeight / (nodeCount - 1);

        x = sourceX;
        y = topMargin + index * stepY;
        this.coreX = Math.max(54, w * 0.14);
        this.coreY = h / 2;
      } else if (dir === "top-to-bottom") {
        const sourceY = Math.max(45, h * 0.14);
        const leftMargin = 40;
        const availableWidth = w - leftMargin * 2;
        const stepX = availableWidth / (nodeCount - 1);

        x = leftMargin + index * stepX;
        y = sourceY;
        this.coreX = w / 2;
        this.coreY = h - Math.max(50, h * 0.18);
      } else if (dir === "radial") {
        this.coreX = w / 2;
        this.coreY = h / 2;
        const radius = Math.min(w, h) * 0.38;
        const angleStep = (Math.PI * 2) / nodeCount;
        const angle = index * angleStep - Math.PI / 2;

        x = this.coreX + Math.cos(angle) * radius;
        y = this.coreY + Math.sin(angle) * radius;
      }

      return {
        id: def.id,
        name: custom?.name ?? def.name,
        subtitle: custom?.subtitle ?? def.subtitle,
        iconType: custom?.iconType ?? def.icon,
        x,
        y,
        color: custom?.color ?? brand.primary,
        accent: brand.secondary,
        status: custom?.status ?? "streaming",
        enabled: custom?.enabled ?? true,
        packetRate: custom?.packetRate ?? 1.0 + Math.sin(index) * 0.3,
        activeRequests: 14 + index * 4,
      };
    });

    this.coreRadius = Math.min(w, h) * 0.08 + 14;
  }

  private setupEvents(): void {
    if (!this.options.interactive) return;

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isHovered = true;

      let found: ProductId | null = null;
      for (const src of this.sources) {
        if (!src.enabled) continue;
        const dx = this.mouseX - src.x;
        const dy = this.mouseY - src.y;
        if (dx * dx + dy * dy < 22 * 22) {
          found = src.id;
          break;
        }
      }
      this.hoveredSourceId = found;
      if (this.options.onSelectSource) {
        this.options.onSelectSource(found);
      }
    });

    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (const src of this.sources) {
        const dx = clickX - src.x;
        const dy = clickY - src.y;
        if (dx * dx + dy * dy < 24 * 24) {
          if (this.options.onNodeClick) {
            this.options.onNodeClick(src);
          }
          break;
        }
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

  public emitPacket(sourceIndex: number, isOutbound = false): void {
    const src = this.sources[sourceIndex];
    if (!src || !src.enabled) return;

    const brand = PRODUCT_BRANDS[src.id];
    const speed = (0.3 + Math.random() * 0.2) * (this.options.speedMultiplier || 1);

    this.particles.push({
      id: this.nextParticleId++,
      sourceId: src.id,
      x: isOutbound ? this.coreX : src.x,
      y: isOutbound ? this.coreY : src.y,
      vx: 0,
      vy: 0,
      progress: 0,
      speed,
      size: 2.4 + Math.random() * 1.8,
      alpha: 0.95,
      color: isOutbound ? "#38bdf8" : src.color,
      glowColor: isOutbound ? "rgba(56, 189, 248, 0.5)" : brand.glow,
      isOutbound,
      dataPayload: {
        requestId: `0x${Math.random().toString(16).substring(2, 6)}`,
        latencyMs: Math.round(5 + Math.random() * 14),
        tokens: Math.round(150 + Math.random() * 320),
        label: src.name.substring(0, 3).toUpperCase(),
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

    // 1. Draw connecting conduits
    this.drawConduits(ctx);

    // 2. Spawn and update particles
    this.updateParticles(deltaTime);

    // 3. Draw particles
    this.drawParticles(ctx);

    // 4. Update and draw Orazaka Core reactor
    this.drawCore(ctx, deltaTime);

    // 5. Draw Product Source Nodes & Icons
    this.drawSources(ctx);

    // 6. Draw telemetry overlay if enabled
    if (this.options.showTelemetry) {
      this.drawTelemetryOverlay(ctx);
    }

    ctx.restore();
  }

  private getConduitPoints(src: ProductSourceNode): { p0: Point2D; p1: Point2D; p2: Point2D; p3: Point2D } {
    const dir = this.options.direction || "left-to-right";
    const p0: Point2D = { x: src.x, y: src.y };
    const p3: Point2D = { x: this.coreX, y: this.coreY };

    let p1: Point2D;
    let p2: Point2D;

    if (dir === "left-to-right") {
      const dx = p3.x - p0.x;
      p1 = { x: p0.x + dx * 0.45, y: p0.y };
      p2 = { x: p0.x + dx * 0.75, y: p3.y + (src.y - this.coreY) * 0.15 };
    } else if (dir === "right-to-left") {
      const dx = p3.x - p0.x;
      p1 = { x: p0.x + dx * 0.45, y: p0.y };
      p2 = { x: p0.x + dx * 0.75, y: p3.y + (src.y - this.coreY) * 0.15 };
    } else if (dir === "top-to-bottom") {
      const dy = p3.y - p0.y;
      p1 = { x: p0.x, y: p0.y + dy * 0.45 };
      p2 = { x: p3.x + (src.x - this.coreX) * 0.15, y: p0.y + dy * 0.75 };
    } else {
      // Radial
      const mx = (p0.x + p3.x) / 2;
      const my = (p0.y + p3.y) / 2;
      p1 = { x: mx, y: my };
      p2 = { x: mx, y: my };
    }

    return { p0, p1, p2, p3 };
  }

  private drawConduits(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;
    const style = this.options.conduitStyle || "smooth-bezier";

    for (const src of this.sources) {
      if (!src.enabled) continue;

      const isTargeted = activeTarget === src.id;
      const isDimmed = activeTarget !== null && !isTargeted;
      const { p0, p1, p2, p3 } = this.getConduitPoints(src);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);

      if (style === "straight" || this.options.direction === "radial") {
        ctx.lineTo(p3.x, p3.y);
      } else if (style === "cyber-grid") {
        const midX = (p0.x + p3.x) / 2;
        ctx.lineTo(midX, p0.y);
        ctx.lineTo(midX, p3.y);
        ctx.lineTo(p3.x, p3.y);
      } else {
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      }

      ctx.lineWidth = isTargeted ? 2.6 : 1.2;
      let stroke = "rgba(249, 115, 22, 0.2)";
      if (isTargeted) stroke = src.color;
      else if (isDimmed) stroke = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = stroke;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -this.time * 26;
      ctx.stroke();

      if (isTargeted) {
        ctx.lineWidth = 8;
        ctx.strokeStyle = src.color;
        ctx.globalAlpha = 0.18;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private updateParticles(deltaTime: number): void {
    const density = this.options.particleDensity || 1.0;
    const spawnChance = 0.4 * density;
    const flowMode = this.options.flowMode || "inbound";

    if (Math.random() < spawnChance) {
      const activeSources = this.sources.filter((s) => s.enabled);
      if (activeSources.length > 0) {
        const randomSource = Math.floor(Math.random() * this.sources.length);
        if (flowMode === "inbound" || (flowMode === "bidirectional" && Math.random() < 0.6)) {
          this.emitPacket(randomSource, false);
        } else {
          this.emitPacket(randomSource, true);
        }
      }
    }

    const kept: Particle[] = [];
    for (const p of this.particles) {
      p.progress += p.speed * deltaTime;

      if (p.progress >= 1) {
        if (!p.isOutbound) {
          this.corePulse = Math.min(this.corePulse + 0.18, 1.2);
          this.totalRequests++;

          if (this.shockwaves.length < 6 && Math.random() < 0.4) {
            this.shockwaves.push({
              radius: this.coreRadius * 0.7,
              maxRadius: this.coreRadius * 2.6,
              alpha: 0.7,
              color: p.color,
            });
          }
        }
        continue;
      }

      const src = this.sources.find((s) => s.id === p.sourceId);
      if (src) {
        const { p0, p1, p2, p3 } = this.getConduitPoints(src);

        // If outbound: start from core (p3) to source (p0)
        const t = p.isOutbound ? 1 - p.progress : p.progress;
        const mt = 1 - t;

        if (this.options.conduitStyle === "straight" || this.options.direction === "radial") {
          p.x = p0.x + (p3.x - p0.x) * t;
          p.y = p0.y + (p3.y - p0.y) * t;
        } else {
          p.x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
          p.y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
        }

        // Magnetic attraction to cursor
        if (this.isHovered) {
          const dx = this.mouseX - p.x;
          const dy = this.mouseY - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 70 * 70 && distSq > 1) {
            const force = (1 - Math.sqrt(distSq) / 70) * 8;
            p.x += (dx / Math.sqrt(distSq)) * force;
            p.y += (dy / Math.sqrt(distSq)) * force;
          }
        }
      }

      kept.push(p);
    }
    this.particles = kept;
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;
    const style = this.options.particleStyle || "photons";

    for (const p of this.particles) {
      const isTargeted = activeTarget === p.sourceId;
      const isDimmed = activeTarget !== null && !isTargeted;
      const alpha = isDimmed ? 0.15 : isTargeted ? 1.0 : 0.85;

      ctx.save();

      if (style === "data-blocks") {
        // Hex byte data packet
        ctx.fillStyle = isTargeted ? "#ffffff" : p.color;
        ctx.font = "8px SF Mono, monospace";
        ctx.globalAlpha = alpha;
        ctx.fillText(p.dataPayload?.requestId || "0x9F", p.x - 10, p.y - 4);
        ctx.fillRect(p.x - 2, p.y - 2, 5, 5);
      } else if (style === "beams") {
        // Elongated laser segment
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = alpha * 0.4;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p.x - 8, p.y);
        ctx.lineTo(p.x + 8, p.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      } else {
        // Default glowing photons
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = alpha * 0.55;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isTargeted ? "#ffffff" : p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawCore(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const brand = PRODUCT_BRANDS.orazaka;

    this.corePulse = Math.max(0, this.corePulse - deltaTime * 1.5);
    const pulseScale = 1 + this.corePulse * 0.15 + Math.sin(this.time * 3) * 0.04;
    const currentRadius = this.coreRadius * pulseScale;

    // Shockwaves
    const aliveWaves: typeof this.shockwaves = [];
    for (const wave of this.shockwaves) {
      wave.radius += deltaTime * 50;
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

    // Ambient radial bloom
    const grad = ctx.createRadialGradient(this.coreX, this.coreY, 2, this.coreX, this.coreY, currentRadius * 2.4);
    grad.addColorStop(0, "rgba(249, 115, 22, 0.45)");
    grad.addColorStop(0.5, "rgba(249, 115, 22, 0.14)");
    grad.addColorStop(1, "rgba(249, 115, 22, 0)");

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.coreX, this.coreY, currentRadius * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Rotating orbital ring
    ctx.save();
    ctx.translate(this.coreX, this.coreY);
    ctx.rotate(this.time * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 1.25, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(249, 115, 22, 0.35)";
    ctx.setLineDash([8, 12]);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // Core body
    ctx.beginPath();
    ctx.arc(this.coreX, this.coreY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#120b06";
    ctx.strokeStyle = brand.primary;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = brand.primary;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center Mark (converging nodes)
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

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = brand.secondary;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  private drawSources(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;
    const showLabels = this.options.showLabels !== false;

    for (const src of this.sources) {
      if (!src.enabled) continue;

      const isTargeted = activeTarget === src.id;
      const isDimmed = activeTarget !== null && !isTargeted;
      const alpha = isDimmed ? 0.35 : 1.0;
      const nodeR = 14;

      ctx.save();

      // Outer interactive halo
      if (isTargeted) {
        ctx.beginPath();
        ctx.arc(src.x, src.y, nodeR + 6, 0, Math.PI * 2);
        ctx.fillStyle = src.color;
        ctx.globalAlpha = 0.25;
        ctx.fill();
      }

      // Solid Node Body
      ctx.beginPath();
      ctx.arc(src.x, src.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = "#0c0d0f";
      ctx.strokeStyle = isTargeted ? "#ffffff" : src.color;
      ctx.lineWidth = isTargeted ? 2.2 : 1.4;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = src.color;
      ctx.shadowBlur = isTargeted ? 12 : 4;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw vector icon inside node
      this.drawVectorIcon(ctx, src.x, src.y, src.iconType, src.color, isTargeted ? "#ffffff" : src.color);

      // Draw custom text labels & subtitle
      if (showLabels) {
        ctx.font = "bold 11px Inter, system-ui, sans-serif";
        ctx.fillStyle = isTargeted ? "#ffffff" : "#f0f2f5";
        ctx.globalAlpha = alpha;

        const dir = this.options.direction || "left-to-right";
        if (dir === "left-to-right") {
          ctx.textAlign = "right";
          ctx.fillText(src.name, src.x - 20, src.y - 1);
          ctx.font = "9px SF Mono, monospace";
          ctx.fillStyle = src.color;
          ctx.fillText(src.subtitle, src.x - 20, src.y + 11);
        } else if (dir === "right-to-left") {
          ctx.textAlign = "left";
          ctx.fillText(src.name, src.x + 20, src.y - 1);
          ctx.font = "9px SF Mono, monospace";
          ctx.fillStyle = src.color;
          ctx.fillText(src.subtitle, src.x + 20, src.y + 11);
        } else {
          ctx.textAlign = "center";
          ctx.fillText(src.name, src.x, src.y - 18);
        }
      }

      ctx.restore();
    }
  }

  private drawVectorIcon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    type: IconType,
    primaryColor: string,
    strokeColor: string,
  ): void {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const s = 6;

    if (type === "doc") {
      // Document sheet with fold
      ctx.beginPath();
      ctx.rect(cx - s * 0.7, cy - s, s * 1.4, s * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.4, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.3);
      ctx.moveTo(cx - s * 0.4, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.4, cy + s * 0.3);
      ctx.stroke();
    } else if (type === "video") {
      // Play triangle
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.5, cy - s * 0.7);
      ctx.lineTo(cx + s * 0.8, cy);
      ctx.lineTo(cx - s * 0.5, cy + s * 0.7);
      ctx.closePath();
      ctx.fill();
    } else if (type === "chart") {
      // Trendline / bars
      ctx.beginPath();
      ctx.moveTo(cx - s, cy + s * 0.6);
      ctx.lineTo(cx - s * 0.3, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.2);
      ctx.lineTo(cx + s, cy - s * 0.7);
      ctx.stroke();
    } else if (type === "calendar") {
      // Calendar grid
      ctx.beginPath();
      ctx.rect(cx - s, cy - s * 0.7, s * 2, s * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s * 0.1);
      ctx.lineTo(cx + s, cy - s * 0.1);
      ctx.stroke();
    } else if (type === "chat") {
      // Message bubble
      ctx.beginPath();
      ctx.arc(cx, cy - 1, s * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy + s * 0.7);
      ctx.lineTo(cx - 6, cy + s * 1.1);
      ctx.lineTo(cx + 1, cy + s * 0.8);
      ctx.stroke();
    } else if (type === "voice") {
      // Waveform bars
      for (let i = -2; i <= 2; i++) {
        const barH = (3 - Math.abs(i)) * 2.8;
        ctx.beginPath();
        ctx.moveTo(cx + i * 2.5, cy - barH);
        ctx.lineTo(cx + i * 2.5, cy + barH);
        ctx.stroke();
      }
    } else if (type === "brain") {
      // Brain hemispheres
      ctx.beginPath();
      ctx.arc(cx - 2, cy, 4, 0, Math.PI * 2);
      ctx.arc(cx + 2, cy, 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "zap") {
      // Lightning bolt
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy - s);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 1, cy + s);
      ctx.lineTo(cx + 3, cy - 1);
      ctx.lineTo(cx, cy - 1);
      ctx.closePath();
      ctx.fill();
    } else if (type === "shield") {
      // Shield
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy - s * 0.5);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy - s * 0.5);
      ctx.closePath();
      ctx.stroke();
    } else {
      // CPU
      ctx.beginPath();
      ctx.rect(cx - s * 0.8, cy - s * 0.8, s * 1.6, s * 1.6);
      ctx.stroke();
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }

    ctx.restore();
  }

  private drawTelemetryOverlay(ctx: CanvasRenderingContext2D): void {
    const activeTarget = this.options.highlightedSource || this.hoveredSourceId;

    ctx.save();
    ctx.font = "10px SF Mono, monospace";
    ctx.textBaseline = "middle";

    if (activeTarget) {
      const src = this.sources.find((s) => s.id === activeTarget);
      if (src) {
        const text = `${src.name.toUpperCase()} [${src.subtitle}] · 11ms · STREAM ACTIVE`;
        ctx.fillStyle = "rgba(12, 13, 15, 0.88)";
        ctx.strokeStyle = src.color;
        ctx.lineWidth = 1;
        const textW = ctx.measureText(text).width;
        ctx.roundRect(this.width / 2 - textW / 2 - 10, this.height - 24, textW + 20, 20, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = src.color;
        ctx.fillText(text, this.width / 2 - textW / 2, this.height - 14);
      }
    } else {
      ctx.fillStyle = "rgba(249, 115, 22, 0.65)";
      const stats = `ORAZAKA NEURAL ENGINE · ${this.totalRequests} REQ · 6 PIPELINES`;
      ctx.fillText(stats, 12, this.height - 12);
    }

    ctx.restore();
  }
}
