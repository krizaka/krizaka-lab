"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, type CSSProperties } from "react";
import { NeuralLatticeRenderer, type NeuralLatticeOptions } from "../core/neural-lattice";
import { MotionController } from "../core/motion-controller";

export interface NeuralLatticeViewHandle {
  triggerCascadeAvalanche: () => void;
  getRenderer: () => NeuralLatticeRenderer | null;
}

export interface NeuralLatticeViewProps {
  nodeCount?: number;
  connectionDistance?: number;
  interactive?: boolean;
  pulseFrequency?: number;
  enableHebbianPlasticity?: boolean;
  theme?: "obsidian-gold" | "sage-calm" | "prussian-cyan";
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const NeuralLatticeView = forwardRef<NeuralLatticeViewHandle, NeuralLatticeViewProps>(function NeuralLatticeView(
  {
    nodeCount = 52,
    connectionDistance = 110,
    interactive = true,
    pulseFrequency = 1.0,
    enableHebbianPlasticity = true,
    theme = "obsidian-gold",
    playing = true,
    className = "",
    style,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<NeuralLatticeRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);

  useImperativeHandle(ref, () => ({
    triggerCascadeAvalanche: () => {
      rendererRef.current?.triggerCascadeAvalanche();
    },
    getRenderer: () => rendererRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new NeuralLatticeRenderer(canvas, {
      nodeCount,
      connectionDistance,
      interactive,
      pulseFrequency,
      enableHebbianPlasticity,
      theme,
    });
    rendererRef.current = renderer;

    const controller = new MotionController({
      canvas,
      playing,
      onRender: (deltaTime, timestamp) => {
        renderer.render(deltaTime, timestamp);
      },
      onResize: (w, h, dpr) => {
        renderer.setDimensions(w, h, dpr);
      },
    });
    controllerRef.current = controller;
    controller.evaluateLoopState();

    return () => {
      controller.destroy();
      rendererRef.current = null;
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setOptions({
        nodeCount,
        connectionDistance,
        interactive,
        pulseFrequency,
        enableHebbianPlasticity,
        theme,
      });
    }
  }, [nodeCount, connectionDistance, interactive, pulseFrequency, enableHebbianPlasticity, theme]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setPlaying(playing);
    }
  }, [playing]);

  return (
    <div
      className={`kz-motion-lattice relative w-full h-full overflow-hidden rounded-xl bg-kz-surface0 border border-kz-border/40 select-none ${className}`}
      data-motion-scope=""
      data-play={playing ? "" : undefined}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
        aria-label="Quantum Neural Synapse Lattice"
        role="img"
      />
    </div>
  );
});
