"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { LiquidCausticsRenderer, type CausticsOptions, type CausticPalette } from "../core/liquid-caustics";
import { MotionController } from "../core/motion-controller";

export interface LiquidCausticsViewProps {
  palette?: CausticPalette;
  playing?: boolean;
  interactive?: boolean;
  viscosity?: number;
  refractionStrength?: number;
  className?: string;
  style?: CSSProperties;
}

export function LiquidCausticsView({
  palette = "obsidian",
  playing = true,
  interactive = true,
  viscosity = 0.98,
  refractionStrength = 1.0,
  className = "",
  style,
}: LiquidCausticsViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<LiquidCausticsRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new LiquidCausticsRenderer(canvas, {
      palette,
      interactive,
      viscosity,
      refractionStrength,
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
        palette,
        interactive,
        viscosity,
        refractionStrength,
      });
    }
  }, [palette, interactive, viscosity, refractionStrength]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setPlaying(playing);
    }
  }, [playing]);

  return (
    <div
      className={`kz-motion-caustics relative w-full h-full overflow-hidden rounded-xl bg-kz-surface0 border border-kz-border/40 select-none ${className}`}
      data-motion-scope=""
      data-play={playing ? "" : undefined}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none"
        aria-label="Liquid Glass Caustics and Chromatic Refraction"
        role="img"
      />
    </div>
  );
}
