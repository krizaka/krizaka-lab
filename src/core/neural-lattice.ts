/**
 * @krizaka/motion — Quantum Neural Synapse Lattice Engine (V2 Next-Level)
 * Biological Hodgkin-Huxley action potential propagation, cognitive cluster engrams,
 * Hebbian synaptic plasticity, and synchronous neuro-cascade avalanche.
 * 100% self-contained in krizaka-lab.
 */

import { Point2D } from "./types";
import { SpringVector2D } from "./spring-physics";

export type CognitiveCluster = "orazaka" | "voice" | "jarvis";

export interface SynapseNode {
  id: number;
  cluster: CognitiveCluster;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  membranePotential: number; // -70mV to +30mV (normalized 0 to 1)
  synapticRefractory: number;
  firingThreshold: number;
  neighbors: Array<{ nodeId: number; weight: number }>; // Hebbian synaptic weights
}

export interface ActionPotential {
  fromNodeId: number;
  toNodeId: number;
  progress: number;
  speed: number;
  intensity: number;
  color: string;
}

export interface NeuralLatticeOptions {
  nodeCount?: number;
  connectionDistance?: number;
  interactive?: boolean;
  pulseFrequency?: number;
  enableHebbianPlasticity?: boolean;
  theme?: "obsidian-gold" | "sage-calm" | "prussian-cyan";
}

const CLUSTER_COLORS: Record<CognitiveCluster, { primary: string; secondary: string; glow: string }> = {
  orazaka: { primary: "#f97316", secondary: "#fdba74", glow: "rgba(249, 115, 22, 0.45)" },
  voice: { primary: "#7c9082", secondary: "#b8c5b9", glow: "rgba(124, 144, 130, 0.45)" },
  jarvis: { primary: "#00f0ff", secondary: "#38bdf8", glow: "rgba(0, 240, 255, 0.45)" },
};

export class NeuralLatticeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: NeuralLatticeOptions;
  private width = 600;
  private height = 400;
  private dpr = 1;

  private nodes: SynapseNode[] = [];
  private potentials: ActionPotential[] = [];
  private time = 0;
  private mousePos: Point2D = { x: -1000, y: -1000 };
  private cursorSpring: SpringVector2D;

  constructor(canvas: HTMLCanvasElement, options: NeuralLatticeOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get 2d context");
    this.ctx = context;

    this.options = {
      nodeCount: 52,
      connectionDistance: 110,
      interactive: true,
      pulseFrequency: 1.0,
      enableHebbianPlasticity: true,
      theme: "obsidian-gold",
      ...options,
    };

    this.cursorSpring = new SpringVector2D(2.0, 0.75, 0.0);
    this.initLayout(canvas.clientWidth || 600, canvas.clientHeight || 400, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<NeuralLatticeOptions>): void {
    const countChanged = options.nodeCount && options.nodeCount !== this.options.nodeCount;
    this.options = { ...this.options, ...options };
    if (countChanged) {
      this.initNodes();
    }
  }

  public setDimensions(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.initNodes();
  }

  private initLayout(w: number, h: number, dpr: number): void {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.initNodes();
  }

  private initNodes(): void {
    const count = this.options.nodeCount || 52;
    this.nodes = [];
    this.potentials = [];

    const padding = 28;
    const innerW = this.width - padding * 2;
    const innerH = this.height - padding * 2;
    const clusters: CognitiveCluster[] = ["orazaka", "voice", "jarvis"];

    for (let i = 0; i < count; i++) {
      const cluster = clusters[i % 3];
      this.nodes.push({
        id: i,
        cluster,
        x: padding + Math.random() * innerW,
        y: padding + Math.random() * innerH,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16,
        baseRadius: 2.8 + Math.random() * 2.0,
        membranePotential: Math.random() * 0.3,
        synapticRefractory: 0,
        firingThreshold: 0.65 + Math.random() * 0.2,
        neighbors: [],
      });
    }

    this.recomputeNeighbors();
  }

  private recomputeNeighbors(): void {
    const maxDist = this.options.connectionDistance || 110;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      a.neighbors = [];

      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          a.neighbors.push({ nodeId: j, weight: 1.0 });
        }
      }
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

    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of this.nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy < 90 * 90) {
          this.stimulateNode(node, 1.0);
        }
      }
    });
  }

  /** Triggers a synchronous neuro-avalanche cascade across the lattice */
  public triggerCascadeAvalanche(): void {
    for (let i = 0; i < Math.min(8, this.nodes.length); i++) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      if (randomNode) this.stimulateNode(randomNode, 1.2);
    }
  }

  public stimulateNode(node: SynapseNode, intensity = 1.0): void {
    node.membranePotential = Math.min(1.0, node.membranePotential + intensity);
    if (node.membranePotential >= node.firingThreshold && node.synapticRefractory <= 0) {
      this.fireNodeActionPotential(node);
    }
  }

  private fireNodeActionPotential(node: SynapseNode): void {
    node.synapticRefractory = 0.4;
    node.membranePotential = 0.1;
    const colors = CLUSTER_COLORS[node.cluster];

    for (const neighbor of node.neighbors) {
      if (Math.random() < 0.6) {
        if (this.options.enableHebbianPlasticity) {
          neighbor.weight = Math.min(2.8, neighbor.weight + 0.12);
        }

        this.potentials.push({
          fromNodeId: node.id,
          toNodeId: neighbor.nodeId,
          progress: 0,
          speed: 1.8 + Math.random() * 1.2,
          intensity: 1.0,
          color: colors.primary,
        });
      }
    }
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime;
    const ctx = this.ctx;
    const dpr = this.dpr;

    this.cursorSpring.update(this.mousePos.x, this.mousePos.y, deltaTime);
    const cursor = { x: this.cursorSpring.x.getValue(), y: this.cursorSpring.y.getValue() };

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Update nodes
    this.updateNodes(deltaTime, cursor);

    // 2. Spontaneous biological oscillations
    if (Math.random() < 0.3 * (this.options.pulseFrequency || 1)) {
      const randNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      if (randNode) this.stimulateNode(randNode, 0.7);
    }

    // 3. Draw synaptic axons
    this.drawAxons(ctx);

    // 4. Update and draw action potentials
    this.drawPotentials(ctx, deltaTime);

    // 5. Draw synaptic nodes
    this.drawNodes(ctx, cursor);

    // 6. Draw cluster telemetry legend
    this.drawClusterLegend(ctx);

    ctx.restore();
  }

  private updateNodes(dt: number, cursor: Point2D): void {
    const pad = 24;

    for (const n of this.nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      if (n.x < pad) { n.x = pad; n.vx *= -1; }
      else if (n.x > this.width - pad) { n.x = this.width - pad; n.vx *= -1; }
      if (n.y < pad) { n.y = pad; n.vy *= -1; }
      else if (n.y > this.height - pad) { n.y = this.height - pad; n.vy *= -1; }

      if (cursor.x > 0 && cursor.y > 0) {
        const dx = cursor.x - n.x;
        const dy = cursor.y - n.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 130 * 130 && distSq > 4) {
          const force = (1 - Math.sqrt(distSq) / 130) * 16;
          n.x += (dx / Math.sqrt(distSq)) * force * dt;
          n.y += (dy / Math.sqrt(distSq)) * force * dt;
          this.stimulateNode(n, dt * 1.8);
        }
      }

      n.synapticRefractory = Math.max(0, n.synapticRefractory - dt);
      n.membranePotential = Math.max(0.05, n.membranePotential - dt * 0.4);
    }
  }

  private drawAxons(ctx: CanvasRenderingContext2D): void {
    const maxDist = this.options.connectionDistance || 110;

    for (const a of this.nodes) {
      const colors = CLUSTER_COLORS[a.cluster];
      for (const neighbor of a.neighbors) {
        const b = this.nodes[neighbor.nodeId];
        if (!b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.3 * (neighbor.weight / 1.5);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.membranePotential > 0.4 || b.membranePotential > 0.4 ? colors.primary : "rgba(142, 146, 151, 0.2)";
          ctx.lineWidth = neighbor.weight > 1.4 ? 1.6 : 0.8;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.stroke();
        }
      }
    }
  }

  private drawPotentials(ctx: CanvasRenderingContext2D, dt: number): void {
    const alive: ActionPotential[] = [];

    for (const p of this.potentials) {
      p.progress += p.speed * dt;

      if (p.progress < 1) {
        const from = this.nodes[p.fromNodeId];
        const to = this.nodes[p.toNodeId];

        if (from && to) {
          const curX = from.x + (to.x - from.x) * p.progress;
          const curY = from.y + (to.y - from.y) * p.progress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(curX, curY, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
        alive.push(p);
      } else {
        const dest = this.nodes[p.toNodeId];
        if (dest) {
          this.stimulateNode(dest, 0.4);
        }
      }
    }
    this.potentials = alive;
  }

  private drawNodes(ctx: CanvasRenderingContext2D, cursor: Point2D): void {
    for (const n of this.nodes) {
      const colors = CLUSTER_COLORS[n.cluster];
      const isFiring = n.membranePotential > 0.4;
      const r = n.baseRadius * (1 + n.membranePotential * 0.7);

      ctx.save();
      if (isFiring) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = colors.glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isFiring ? "#ffffff" : colors.primary;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.3;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = isFiring ? 10 : 3;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawClusterLegend(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = "10px SF Mono, monospace";
    ctx.textBaseline = "middle";

    const legends: Array<{ cluster: CognitiveCluster; label: string }> = [
      { cluster: "orazaka", label: "ENGINE" },
      { cluster: "voice", label: "VOICE" },
      { cluster: "jarvis", label: "REASONING" },
    ];

    let startX = 14;
    for (const leg of legends) {
      const colors = CLUSTER_COLORS[leg.cluster];
      ctx.beginPath();
      ctx.arc(startX + 4, this.height - 14, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fillText(leg.label, startX + 14, this.height - 14);
      startX += ctx.measureText(leg.label).width + 30;
    }

    ctx.restore();
  }
}
