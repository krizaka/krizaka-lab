"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from "react";
import {
  JarvisHUDRenderer,
  type JarvisHUDOptions,
  type JarvisTacticalMode,
  type TargetLock,
} from "../core/jarvis-hud";
import { MotionController } from "../core/motion-controller";
import { type JarvisTheme } from "../core/types";

export interface JarvisHUDHandle {
  lockTarget: (x: number, y: number) => void;
  clearTarget: () => void;
  getRenderer: () => JarvisHUDRenderer | null;
}

export interface JarvisHUDProps {
  /**
   * Color theme variant for the holographic interface.
   * @default "cyan"
   */
  theme?: JarvisTheme;
  /**
   * Combat tactical posture (standard, combat, stealth, overdrive).
   * @default "standard"
   */
  tacticalMode?: JarvisTacticalMode;
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
  showEnergyMatrix?: boolean;
  onTargetLocked?: (target: TargetLock) => void;
  className?: string;
  style?: CSSProperties;
}

export const JarvisHUD = forwardRef<JarvisHUDHandle, JarvisHUDProps>(function JarvisHUD(
  {
    theme = "cyan",
    tacticalMode = "standard",
    overdrive = false,
    interactive3D = true,
    playing = true,
    rotationSpeed = 1.0,
    showDiagnostics = true,
    showEnergyMatrix = true,
    onTargetLocked,
    className = "",
    style,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<JarvisHUDRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);

  useImperativeHandle(ref, () => ({
    lockTarget: (x: number, y: number) => {
      rendererRef.current?.lockTargetAt(x, y);
    },
    clearTarget: () => {
      rendererRef.current?.clearTargetLock();
    },
    getRenderer: () => rendererRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new JarvisHUDRenderer(canvas, {
      theme,
      tacticalMode,
      overdrive,
      interactive3D,
      rotationSpeed,
      showDiagnostics,
      showEnergyMatrix,
      onTargetLocked,
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
        tacticalMode,
        overdrive,
        interactive3D,
        rotationSpeed,
        showDiagnostics,
        showEnergyMatrix,
        onTargetLocked,
      });
    }
  }, [
    theme,
    tacticalMode,
    overdrive,
    interactive3D,
    rotationSpeed,
    showDiagnostics,
    showEnergyMatrix,
    onTargetLocked,
  ]);

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
        className="w-full h-full block cursor-crosshair touch-none"
        aria-label="Jarvis Iron Man Holographic HUD AI Core"
        role="img"
      />
    </div>
  );
});
