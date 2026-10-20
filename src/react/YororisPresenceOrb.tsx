"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { YororisAcousticRenderer, type YororisAcousticOptions } from "../core/yororis-synthesis";
import { MotionController } from "../core/motion-controller";
import { type YororisState } from "../core/types";

export interface YororisPresenceOrbProps {
  /**
   * Current acoustic or psychological presence state.
   * @default "idle"
   */
  state?: YororisState;
  /**
   * Conforms to @krizaka/ui/motion governance.
   * @default true
   */
  playing?: boolean;
  interactive?: boolean;
  intensity?: number;
  showRings?: boolean;
  enableAudio?: boolean;
  onAudioToggled?: (active: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export function YororisPresenceOrb({
  state = "idle",
  playing = true,
  interactive = true,
  intensity = 1.0,
  showRings = true,
  enableAudio = false,
  onAudioToggled,
  className = "",
  style,
}: YororisPresenceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<YororisAcousticRenderer | null>(null);
  const controllerRef = useRef<MotionController | null>(null);
  const [audioActive, setAudioActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new YororisAcousticRenderer(canvas, {
      state,
      interactive,
      intensity,
      showRings,
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
      if (rendererRef.current) {
        rendererRef.current.toggleProceduralAudio(false);
      }
      controller.destroy();
      rendererRef.current = null;
      controllerRef.current = null;
    };
  }, []);

  // Update state & options
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setOptions({
        state,
        interactive,
        intensity,
        showRings,
      });
    }
  }, [state, interactive, intensity, showRings]);

  // Synchronize audio synthesis state
  useEffect(() => {
    if (rendererRef.current && enableAudio !== audioActive) {
      const active = rendererRef.current.toggleProceduralAudio(enableAudio);
      setAudioActive(active);
      if (onAudioToggled) onAudioToggled(active);
    }
  }, [enableAudio]);

  // Synchronize playing state with @krizaka/ui motion system
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setPlaying(playing);
    }
  }, [playing]);

  return (
    <div
      className={`kz-motion-yororis relative w-full h-full overflow-hidden rounded-xl bg-kz-surface0 border border-kz-yororis/20 select-none ${className}`}
      data-motion-scope=""
      data-play={playing ? "" : undefined}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none"
        aria-label="Yororis 3D generative acoustic presence sphere"
        role="img"
      />
    </div>
  );
}
