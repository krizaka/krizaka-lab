"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { JarvisHUDRenderer, type JarvisHUDOptions } from "../core/jarvis-hud";
import { MotionController } from "../core/motion-controller";
import { type JarvisTheme } from "../core/types";

export interface JarvisHUDProps {
  /**
   * Color theme variant for the holographic interface.
   * @default "cyan"
   */
  theme?: JarvisTheme;
  /**
   * Engages high-alert overdrive mode (crimson flash, amplified telemetry).
   * @default false
   */
  overdrive?: boolean;
  /**
   * Enables 3D parallax tilt responsive to mouse/touch coordinates.
   * @default true
   */
  interactive3D?: boolean;
  /**
   * Conforms to @krizaka/ui/motion governance.
   * @default true
   */
  playing?: boolean;
  rotationSpeed?: number;
  showDiagnostics?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function JarvisHUD({
  theme = "cyan",
  overdrive = false,
  interactive3D = true,
  playing = true,
  rotationSpeed = 1.0,
  showDiagnostics = true,
  className = "",
  style,
}: JarvisHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<JarvisHUDRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new JarvisHUDRenderer(canvas, {
      theme,
      overdrive,
      interactive3D,
      rotationSpeed,
      showDiagnostics,
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
        theme,
        overdrive,
        interactive3D,
        rotationSpeed,
        showDiagnostics,
      });
    }
  }, [theme, overdrive, interactive3D, rotationSpeed, showDiagnostics]);

  // Synchronize playing state with @krizaka/ui motion system
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setPlaying(playing);
    }
  }, [playing]);

  return (
    <div
      className={`kz-motion-jarvis relative w-full h-full overflow-hidden rounded-xl bg-kz-dark border border-kz-border/50 select-none ${className}`}
      data-motion-scope=""
      data-play={playing ? "" : undefined}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
        aria-label="Jarvis Iron Man Holographic HUD AI Core"
        role="img"
      />
    </div>
  );
}
