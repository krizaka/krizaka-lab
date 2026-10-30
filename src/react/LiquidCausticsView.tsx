"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, type CSSProperties } from "react";
import {
  LiquidCausticsRenderer,
  type CausticsOptions,
  type CausticPalette,
  type FluidMedium,
} from "../core/liquid-caustics";
import { MotionController } from "../core/motion-controller";

export interface LiquidCausticsViewHandle {
  addRipple: (x: number, y: number, strength?: number) => void;
  getRenderer: () => LiquidCausticsRenderer | null;
}

export interface LiquidCausticsViewProps {
  palette?: CausticPalette;
  fluidMedium?: FluidMedium;
  playing?: boolean;
  interactive?: boolean;
  viscosity?: number;
  refractionStrength?: number;
  showUnderlyingText?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const LiquidCausticsView = forwardRef<LiquidCausticsViewHandle, LiquidCausticsViewProps>(
  function LiquidCausticsView(
    {
      palette = "obsidian",
      fluidMedium = "glass",
      playing = true,
      interactive = true,
      viscosity = 0.98,
      refractionStrength = 1.0,
      showUnderlyingText = true,
      className = "",
      style,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<LiquidCausticsRenderer | null>(null);
    const controllerRef = useRef<MotionController | null>(null);

    useImperativeHandle(ref, () => ({
      addRipple: (x: number, y: number, strength?: number) => {
        rendererRef.current?.addRipple(x, y, strength);
      },
      getRenderer: () => rendererRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new LiquidCausticsRenderer(canvas, {
        palette,
        fluidMedium,
        interactive,
        viscosity,
        refractionStrength,
        showUnderlyingText,
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
          fluidMedium,
          interactive,
          viscosity,
          refractionStrength,
          showUnderlyingText,
        });
      }
    }, [palette, fluidMedium, interactive, viscosity, refractionStrength, showUnderlyingText]);

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
  },
);
