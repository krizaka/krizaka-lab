"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { OrazakaEngineRenderer, type OrazakaEngineOptions } from "../core/orazaka-engine";
import { MotionController } from "../core/motion-controller";
import { type ProductId } from "../core/types";

export interface OrazakaEngineFlowProps {
  /**
   * Conforms to @krizaka/ui/motion governance:
   * Whether the animation is playing (e.g. hovered on fine pointer, active on touch).
   * Pauses cleanly under prefers-reduced-motion or when offscreen.
   * @default true
   */
  playing?: boolean;
  interactive?: boolean;
  showTelemetry?: boolean;
  particleDensity?: number;
  speedMultiplier?: number;
  highlightedSource?: ProductId | null;
  onSelectSource?: (sourceId: ProductId | null) => void;
  className?: string;
  style?: CSSProperties;
}

export function OrazakaEngineFlow({
  playing = true,
  interactive = true,
  showTelemetry = true,
  particleDensity = 1.0,
  speedMultiplier = 1.0,
  highlightedSource = null,
  onSelectSource,
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

    // Instantiate high-performance physics renderer
    const renderer = new OrazakaEngineRenderer(canvas, {
      interactive,
      showTelemetry,
      particleDensity,
      speedMultiplier,
      highlightedSource: selectedSource,
      onSelectSource: (src) => {
        setSelectedSource(src);
        if (onSelectSource) onSelectSource(src);
      },
    });
    rendererRef.current = renderer;

    // Connect to @krizaka/ui/motion conductor loop
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
        interactive,
        showTelemetry,
        particleDensity,
        speedMultiplier,
        highlightedSource: selectedSource,
      });
    }
  }, [interactive, showTelemetry, particleDensity, speedMultiplier, selectedSource]);

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
