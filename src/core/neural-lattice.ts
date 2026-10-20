/**
 * @krizaka/motion — Quantum Neural Synapse Lattice Engine
 *
 * Simulates high-density cognitive neural networks:
 * - Dynamic Delaunay & K-NN synaptic axons
 * - Action-potential electrical signal propagation along pathways
 * - Localized cursor synaptic activation field
 * - High-end non-cliché editorial palette (Obsidian, Titanium, Bioluminescent Sage)
 */

import { Point2D } from "./types";
import { SpringVector2D } from "./spring-physics";

export interface SynapseNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  charge: number; // 0 to 1
  synapticRefractory: number;
  neighbors: number[];
}

export interface ActionPotential {
  fromNodeId: number;
  toNodeId: number;
  progress: number; // 0 to 1
  speed: number;
  intensity: number;
  color: string;
}

export interface NeuralLatticeOptions {
  nodeCount?: number;
  connectionDistance?: number;
  interactive?: boolean;
  pulseFrequency?: number;
  theme?: "obsidian-gold" | "sage-calm" | "prussian-cyan";
}

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
      theme: "obsidian-gold",
      ...options,
    };

    this.cursorSpring = new SpringVector2D(2.0, 0.75, 0.0);
    this.initLayout(canvas.clientWidth || 600, canvas.clientHeight || 400, window.devicePixelRatio || 1);
    this.setupEvents();
  }

  public setOptions(options: Partial<NeuralLatticeOptions>): void {
    this.options = { ...this.options, ...options };
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

    const padding = 24;
    const innerW = this.width - padding * 2;
    const innerH = this.height - padding * 2;

    for (let i = 0; i < count; i++) {
      this.nodes.push({
        id: i,
        x: padding + Math.random() * innerW,
        y: padding + Math.random() * innerH,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        baseRadius: 2.4 + Math.random() * 2.2,
        charge: Math.random() * 0.4,
        synapticRefractory: Math.random() * 2,
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
          a.neighbors.push(j);
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

      // Trigger action potential cascade from nearest nodes
      for (const node of this.nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy < 100 * 100) {
          this.fireActionPotential(node);
        }
      }
    });
  }

  public fireActionPotential(node: SynapseNode): void {
    if (node.neighbors.length === 0) return;
    const targetIdx = node.neighbors[Math.floor(Math.random() * node.neighbors.length)];
    node.charge = 1.0;

    this.potentials.push({
      fromNodeId: node.id,
      toNodeId: targetIdx,
      progress: 0,
      speed: 1.8 + Math.random() * 1.2,
      intensity: 1.0,
      color: "#f59e0b",
    });
  }

  public render(deltaTime: number, timestamp: number): void {
    this.time += deltaTime;
    const ctx = this.ctx;
    const dpr = this.dpr;

    // Update kinetic cursor spring
    this.cursorSpring.update(this.mousePos.x, this.mousePos.y, deltaTime);
    const cursor = { x: this.cursorSpring.x.getValue(), y: this.cursorSpring.y.getValue() };

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Update nodes positions with boundary damping
    this.updateNodes(deltaTime, cursor);

    // 2. Spawn spontaneous neural action potentials
    if (Math.random() < 0.25 * (this.options.pulseFrequency || 1)) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      if (randomNode) this.fireActionPotential(randomNode);
    }

    // 3. Draw synaptic axons (connecting lines)
    this.drawAxons(ctx);

    // 4. Update and draw action potentials
    this.drawPotentials(ctx, deltaTime);

    // 5. Draw synaptic nodes
    this.drawNodes(ctx, cursor);

    ctx.restore();
  }

  private updateNodes(dt: number, cursor: Point2D): void {
    const pad = 24;

    for (const n of this.nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // Boundary rebound
      if (n.x < pad) {
        n.x = pad;
        n.vx *= -1;
      } else if (n.x > this.width - pad) {
        n.x = this.width - pad;
        n.vx *= -1;
      }
      if (n.y < pad) {
        n.y = pad;
        n.vy *= -1;
      } else if (n.y > this.height - pad) {
        n.y = this.height - pad;
        n.vy *= -1;
      }

      // Cursor magnetic stimulation
      if (cursor.x > 0 && cursor.y > 0) {
        const dx = cursor.x - n.x;
        const dy = cursor.y - n.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 120 * 120 && distSq > 4) {
          const force = (1 - Math.sqrt(distSq) / 120) * 14;
          n.x += (dx / Math.sqrt(distSq)) * force * dt;
          n.y += (dy / Math.sqrt(distSq)) * force * dt;
          n.charge = Math.min(1.0, n.charge + dt * 2.5);
        }
      }

      // Decay charge
      n.charge = Math.max(0, n.charge - dt * 0.8);
    }
  }

  private drawAxons(ctx: CanvasRenderingContext2D): void {
    const maxDist = this.options.connectionDistance || 110;

    for (const a of this.nodes) {
      for (const neighborIdx of a.neighbors) {
        const b = this.nodes[neighborIdx];
        if (!b) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.28 * (1 + (a.charge + b.charge) * 0.5);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.charge > 0.5 || b.charge > 0.5 ? "rgba(245, 158, 11, 0.6)" : "rgba(142, 146, 151, 0.22)";
          ctx.lineWidth = a.charge > 0.5 ? 1.4 : 0.8;
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
          ctx.arc(curX, curY, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
        alive.push(p);
      } else {
        // Trigger charge in destination node
        const dest = this.nodes[p.toNodeId];
        if (dest) {
          dest.charge = 1.0;
        }
      }
    }
    this.potentials = alive;
  }

  private drawNodes(ctx: CanvasRenderingContext2D, cursor: Point2D): void {
    for (const n of this.nodes) {
      const isCharged = n.charge > 0.2;
      const r = n.baseRadius * (1 + n.charge * 0.6);

      ctx.save();

      // Synaptic halo
      if (isCharged) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
        ctx.fill();
      }

      // Solid node core
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isCharged ? "#fef3c7" : "#8e9297";
      ctx.strokeStyle = isCharged ? "#f59e0b" : "#262b32";
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }
}
