"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { OrazakaEngineRenderer, type OrazakaEngineOptions } from "../core/orazaka-engine";
import { MotionController } from "../core/motion-controller";
import {
  type ProductId,
  type FlowDirection,
  type FlowMode,
  type ParticleStyle,
  type ConduitStyle,
  type ProductSourceNode,
} from "../core/types";

export interface OrazakaEngineFlowProps {
  playing?: boolean;
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
  className?: string;
  style?: CSSProperties;
}

export function OrazakaEngineFlow({
  playing = true,
  direction = "left-to-right",
  flowMode = "inbound",
  particleStyle = "photons",
  conduitStyle = "smooth-bezier",
  interactive = true,
  showTelemetry = true,
  showLabels = true,
  particleDensity = 1.0,
  speedMultiplier = 1.0,
  highlightedSource = null,
  nodeConfigs,
  onSelectSource,
  onNodeClick,
  className = "",
  style,
}: OrazakaEngineFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<OrazakaEngineRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);
  const [selectedSource, setSelectedSource] = useState<ProductId | null>(highlightedSource);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new OrazakaEngineRenderer(canvas, {
      direction,
      flowMode,
      particleStyle,
      conduitStyle,
      interactive,
      showTelemetry,
      showLabels,
      particleDensity,
      speedMultiplier,
      highlightedSource: selectedSource,
      nodeConfigs,
      onSelectSource: (src) => {
        setSelectedSource(src);
        if (onSelectSource) onSelectSource(src);
      },
      onNodeClick,
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

  // Update dynamic properties
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setOptions({
        direction,
        flowMode,
        particleStyle,
        conduitStyle,
        interactive,
        showTelemetry,
        showLabels,
        particleDensity,
        speedMultiplier,
        highlightedSource: selectedSource,
        nodeConfigs,
        onNodeClick,
      });
    }
  }, [
    direction,
    flowMode,
    particleStyle,
    conduitStyle,
    interactive,
    showTelemetry,
    showLabels,
    particleDensity,
    speedMultiplier,
    selectedSource,
    nodeConfigs,
    onNodeClick,
  ]);

  // Synchronize playing state with @krizaka/ui motion system
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setPlaying(playing);
    }
  }, [playing]);

  return (
    <div
      className={`kz-motion-engine relative w-full h-full overflow-hidden rounded-xl bg-kz-surface0 border border-kz-border/40 select-none ${className}`}
      data-motion-scope=""
      data-play={playing ? "" : undefined}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
        aria-label="Orazaka neural pipeline convergence flow"
        role="img"
      />
    </div>
  );
}
