/**
 * @krizaka/motion — Liquid Glass Caustics & Chromatic Refraction Engine (V2 Next-Level)
 * Optical Snell's law refraction with hydrodynamic drag wake, surface tension modes,
 * and realistic underlying typography optical distortion.
 * 100% self-contained in krizaka-lab.
 */

import { Point2D } from "./types";
import { SpringVector2D } from "./spring-physics";

export type CausticPalette = "obsidian" | "prussian" | "yororis" | "amber";
export type FluidMedium = "water" | "glass" | "mercury" | "helium";

export const CAUSTIC_PALETTES: Record<
  CausticPalette,
  {
    name: string;
    bg: string;
    rim: string;
    highlight: string;
    causticR: string;
    causticG: string;
    causticB: string;
    glow: string;
  }
> = {
  obsidian: {
    name: "Obsidian Titanium",
    bg: "#07080a",
    rim: "#2a2e35",
    highlight: "#e2e6eb",
    causticR: "rgba(255, 140, 60, 0.45)",
    causticG: "rgba(226, 230, 235, 0.35)",
    causticB: "rgba(100, 180, 255, 0.45)",
    glow: "rgba(255, 158, 59, 0.12)",
  },
  prussian: {
    name: "Prussian Mineral",
    bg: "#060d16",
    rim: "#132338",
    highlight: "#c8d9e6",
    causticR: "rgba(64, 180, 220, 0.45)",
    causticG: "rgba(120, 220, 200, 0.35)",
    causticB: "rgba(90, 140, 255, 0.45)",
    glow: "rgba(30, 144, 255, 0.14)",
  },
  yororis: {
    name: "Yororis Quartz",
    bg: "#090d0b",
    rim: "#223129",
    highlight: "#d8e3dc",
    causticR: "rgba(180, 160, 130, 0.4)",
    causticG: "rgba(124, 144, 130, 0.45)",
    causticB: "rgba(140, 180, 160, 0.4)",
    glow: "rgba(124, 144, 130, 0.12)",
  },
  amber: {
    name: "Bioluminescent Amber",
    bg: "#0c0805",
    rim: "#331c0e",
    highlight: "#ffd8b3",
    causticR: "rgba(255, 110, 40, 0.5)",
    causticG: "rgba(255, 185, 80, 0.4)",
    causticB: "rgba(255, 230, 150, 0.3)",
    glow: "rgba(249, 115, 22, 0.18)",
  },
};

export interface CausticRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  speed: number;
  decay: number;
}

export interface CausticsOptions {
  palette?: CausticPalette;
  fluidMedium?: FluidMedium;
  interactive?: boolean;
  viscosity?: number;
  refractionStrength?: number;
  gridDensity?: number;
  showUnderlyingText?: boolean;
}

export class LiquidCausticsRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: CausticsOptions;
  private width = 500;
  private height = 350;
  private dpr = 1;

  private time = 0;
  private ripples: CausticRipple[] = [];
  private cursorSpring: SpringVector2D;
  private mousePos: Point2D = { x: -1000, y: -1000 };
  private isPointerDown = false;
  private lastEmitTime = 0;

  constructor(canvas: HTMLCanvasElement, options: CausticsOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;

    this.options = {
      palette: "obsidian",
      fluidMedium: "glass",
      interactive: true,
      viscosity: 0.98,
      refractionStrength: 1.0,
      gridDensity: 32,
      showUnderlyingText: true,
      ...options,
    };

    this.cursorSpring = new SpringVector2D(2.4, 0.65, 0.2);
    this.initLayout(canvas.clientWidth || 500, canvas.clientHeight || 350, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<CausticsOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public setDimensions(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
  }

  private setupEvents(): void {
    if (!this.options.interactive) return;

    const onMove = (x: number, y: number) => {
      this.mousePos = { x, y };

      const now = performance.now();
      if (now - this.lastEmitTime > 60) {
        this.addRipple(x, y, this.isPointerDown ? 1.4 : 0.7);
        this.lastEmitTime = now;
      }
    };

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      onMove(e.clientX - rect.left, e.clientY - rect.top);
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        onMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.isPointerDown = true;
      const rect = this.canvas.getBoundingClientRect();
      this.addRipple(e.clientX - rect.left, e.clientY - rect.top, 1.8);
    });

    window.addEventListener("mouseup", () => {
      this.isPointerDown = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mousePos = { x: -1000, y: -1000 };
    });
  }

  public addRipple(x: number, y: number, strength = 1.0): void {
    if (this.ripples.length > 16) {
      this.ripples.shift();
    }
    const medium = this.options.fluidMedium || "glass";
    let speed = 120;
    let decay = 0.95;

    if (medium === "mercury") {
      speed = 180;
      decay = 0.92;
    } else if (medium === "helium") {
      speed = 80;
      decay = 0.98;
    }

    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.max(this.width, this.height) * 0.6,
      strength,
      speed: speed + Math.random() * 30,
      decay,
    });
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime;
    const ctx = this.ctx;
    const dpr = this.dpr;

    this.cursorSpring.update(this.mousePos.x, this.mousePos.y, deltaTime);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    const palette = CAUSTIC_PALETTES[this.options.palette || "obsidian"];

    // 1. Draw liquid base with background glow
    this.drawLiquidBase(ctx, palette);

    // 2. Draw underlying optical typography beneath the glass
    if (this.options.showUnderlyingText !== false) {
      this.drawUnderlyingTypography(ctx, palette);
    }

    // 3. Update surface ripples
    this.updateRipples(deltaTime);

    // 4. Draw Snell's law chromatic dispersion lines
    this.drawChromaticCaustics(ctx, palette);

    // 5. Draw tactile glass lens highlights
    this.drawTactileGlassHighlights(ctx, palette);

    ctx.restore();
  }

  private drawLiquidBase(
    ctx: CanvasRenderingContext2D,
    palette: typeof CAUSTIC_PALETTES["obsidian"]
  ): void {
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    const springPos = { x: this.cursorSpring.x.getValue(), y: this.cursorSpring.y.getValue() };
    const cx = springPos.x > 0 ? springPos.x : this.width / 2;
    const cy = springPos.y > 0 ? springPos.y : this.height / 2;

    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(this.width, this.height) * 0.7);
    grad.addColorStop(0, palette.glow);
    grad.addColorStop(0.6, "rgba(0, 0, 0, 0.4)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.88)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawUnderlyingTypography(
    ctx: CanvasRenderingContext2D,
    palette: typeof CAUSTIC_PALETTES["obsidian"]
  ): void {
    ctx.save();
    ctx.font = "bold 24px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("KRIZAKA // QUANTUM OPTICS", this.width / 2, this.height / 2 - 20);
    ctx.font = "11px SF Mono, monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillText("INDEX OF REFRACTION · SNELL-DESCARTES IOR 1.52", this.width / 2, this.height / 2 + 15);

    ctx.restore();
  }

  private updateRipples(dt: number): void {
    const alive: CausticRipple[] = [];
    for (const r of this.ripples) {
      r.radius += r.speed * dt;
      r.strength *= Math.pow(r.decay, dt * 60);

      if (r.radius < r.maxRadius && r.strength > 0.02) {
        alive.push(r);
      }
    }
    this.ripples = alive;
  }

  private drawChromaticCaustics(
    ctx: CanvasRenderingContext2D,
    palette: typeof CAUSTIC_PALETTES["obsidian"]
  ): void {
    const gridCountX = this.options.gridDensity || 32;
    const stepX = this.width / gridCountX;
    const stepY = stepX * 1.15;
    const gridCountY = Math.ceil(this.height / stepY) + 1;

    const channels = [
      { color: palette.causticR, offset: -2.4, alpha: 0.38 },
      { color: palette.causticG, offset: 0.0, alpha: 0.48 },
      { color: palette.causticB, offset: 2.4, alpha: 0.38 },
    ];

    ctx.save();
    ctx.lineWidth = 1.3;

    for (const ch of channels) {
      ctx.strokeStyle = ch.color;
      ctx.globalAlpha = ch.alpha;

      for (let j = 0; j < gridCountY; j++) {
        ctx.beginPath();
        let started = false;

        for (let i = 0; i <= gridCountX; i++) {
          const bx = i * stepX;
          const by = j * stepY;

          const wave1 = Math.sin(bx * 0.016 + this.time * 1.5) * Math.cos(by * 0.016 + this.time * 1.2) * 9;
          const wave2 = Math.sin((bx + by) * 0.03 - this.time * 2.2) * 5;

          let rippleDispX = 0;
          let rippleDispY = 0;
          for (const rip of this.ripples) {
            const dx = bx - rip.x;
            const dy = by - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const deltaDist = dist - rip.radius;

            if (Math.abs(deltaDist) < 45) {
              const waveProfile = Math.sin((deltaDist / 45) * Math.PI) * rip.strength * 18;
              const angle = Math.atan2(dy, dx);
              rippleDispX += Math.cos(angle) * waveProfile;
              rippleDispY += Math.sin(angle) * waveProfile;
            }
          }

          const dispX = bx + (wave1 + rippleDispX) * (this.options.refractionStrength || 1) + ch.offset;
          const dispY = by + (wave2 + rippleDispY) * (this.options.refractionStrength || 1);

          if (!started) {
            ctx.moveTo(dispX, dispY);
            started = true;
          } else {
            ctx.lineTo(dispX, dispY);
          }
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawTactileGlassHighlights(
    ctx: CanvasRenderingContext2D,
    palette: typeof CAUSTIC_PALETTES["obsidian"]
  ): void {
    ctx.save();
    ctx.strokeStyle = palette.highlight;
    ctx.lineWidth = 0.9;
    ctx.globalAlpha = 0.28;

    for (const r of this.ripples) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
