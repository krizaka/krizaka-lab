/**
 * @krizaka/motion — Universal Motion Controller
 * Adheres strictly to the "@krizaka/ui first" motion governance:
 * - Integrates with `@krizaka/ui/motion` conductor (`data-motion="ready"`, `data-offscreen`)
 * - Pauses automatically when offscreen or in background
 * - Renders single resting frame under `prefers-reduced-motion`
 * - No competing second observer; listens to DOM attributes driven by MotionObserver
 */

export interface RenderLoopOptions {
  canvas: HTMLCanvasElement;
  onRender: (deltaTime: number, timestamp: number) => void;
  onResize?: (width: number, height: number, dpr: number) => void;
  /** Whether the component is in playing state (e.g. hover, touch on-screen) */
  playing?: boolean;
}

export class MotionController {
  private canvas: HTMLCanvasElement;
  private onRender: (deltaTime: number, timestamp: number) => void;
  private onResize?: (width: number, height: number, dpr: number) => void;
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private playing = true;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  constructor(options: RenderLoopOptions) {
    this.canvas = options.canvas;
    this.onRender = options.onRender;
    this.onResize = options.onResize;
    this.playing = options.playing ?? true;

    // Observe size changes
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncSize();
      });
      this.resizeObserver.observe(this.canvas);
    }

    // Observe changes to html[data-motion] and [data-offscreen]
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      this.mutationObserver = new MutationObserver(() => {
        this.evaluateLoopState();
      });
      this.mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-motion"],
      });
      const scope = this.canvas.closest("[data-motion-scope], section, .kz-backdrop, .pv");
      if (scope) {
        this.mutationObserver.observe(scope, {
          attributes: true,
          attributeFilter: ["data-offscreen", "data-play"],
        });
      }
    }

    this.syncSize();
  }

  public setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    this.playing = playing;
    this.evaluateLoopState();
  }

  public isReducedMotion(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  public isOffscreen(): boolean {
    if (typeof document === "undefined") return false;
    const scope = this.canvas.closest("[data-offscreen]");
    return scope !== null || this.canvas.hasAttribute("data-offscreen");
  }

  public isSettling(): boolean {
    if (typeof document === "undefined") return false;
    return document.documentElement.getAttribute("data-motion") === "settling";
  }

  public syncSize(): { width: number; height: number; dpr: number } {
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2.5);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 10);
    const height = Math.max(rect.height, 10);

    const physicalWidth = Math.floor(width * dpr);
    const physicalHeight = Math.floor(height * dpr);

    if (this.canvas.width !== physicalWidth || this.canvas.height !== physicalHeight) {
      this.canvas.width = physicalWidth;
      this.canvas.height = physicalHeight;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      if (this.onResize) {
        this.onResize(width, height, dpr);
      }
    }

    return { width, height, dpr };
  }

  public evaluateLoopState(): void {
    const shouldRun = this.playing && !this.isReducedMotion() && !this.isOffscreen() && !this.isSettling();
    if (shouldRun && !this.isRunning) {
      this.start();
    } else if (!shouldRun && this.isRunning) {
      this.stop();
      this.renderSingleFrame();
    }
  }

  public start(): void {
    if (this.isRunning) return;
    if (this.isReducedMotion() || this.isOffscreen() || this.isSettling()) {
      this.renderSingleFrame();
      return;
    }
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public renderSingleFrame(): void {
    this.onRender(0.016, performance.now());
  }

  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.onRender(deltaTime, timestamp);

    this.rafId = requestAnimationFrame(this.loop);
  };

  public destroy(): void {
    this.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}
