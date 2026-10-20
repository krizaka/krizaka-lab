"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from "react";
import {
  YororisAcousticRenderer,
  type YororisAcousticOptions,
  type YororisVoiceTone,
} from "../core/yororis-synthesis";
import { MotionController } from "../core/motion-controller";
import { type YororisState } from "../core/types";

export interface YororisPresenceOrbHandle {
  toggleMicrophone: (enable?: boolean) => Promise<boolean>;
  toggleProceduralAudio: (enable?: boolean) => boolean;
  getRenderer: () => YororisAcousticRenderer | null;
}

export interface YororisPresenceOrbProps {
  /**
   * Current acoustic or psychological presence state.
   * @default "idle"
   */
  state?: YororisState;
  /**
   * Vocal resonance profile / harmonic frequency band.
   * @default "lea"
   */
  voiceTone?: YororisVoiceTone;
  /**
   * Conforms to @krizaka/ui/motion governance.
   * @default true
   */
  playing?: boolean;
  interactive?: boolean;
  intensity?: number;
  showRings?: boolean;
  showSpores?: boolean;
  showAuraFace?: boolean;
  audioReactive?: boolean;
  enableAudio?: boolean;
  onAudioToggled?: (active: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export const YororisPresenceOrb = forwardRef<YororisPresenceOrbHandle, YororisPresenceOrbProps>(
  function YororisPresenceOrb(
    {
      state = "idle",
      voiceTone = "lea",
      playing = true,
      interactive = true,
      intensity = 1.0,
      showRings = true,
      showSpores = true,
      showAuraFace = true,
      audioReactive = false,
      enableAudio = false,
      onAudioToggled,
      className = "",
      style,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<YororisAcousticRenderer | null>(null);
    const controllerRef = useRef<MotionController | null>(null);
    const [audioActive, setAudioActive] = useState(false);

    useImperativeHandle(ref, () => ({
      toggleMicrophone: async (enable?: boolean) => {
        if (!rendererRef.current) return false;
        return rendererRef.current.toggleMicrophone(enable);
      },
      toggleProceduralAudio: (enable?: boolean) => {
        if (!rendererRef.current) return false;
        const res = rendererRef.current.toggleProceduralAudio(enable);
        setAudioActive(res);
        if (onAudioToggled) onAudioToggled(res);
        return res;
      },
      getRenderer: () => rendererRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new YororisAcousticRenderer(canvas, {
        state,
        voiceTone,
        interactive,
        intensity,
        showRings,
        showSpores,
        showAuraFace,
        audioReactive,
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
          rendererRef.current.toggleMicrophone(false);
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
          voiceTone,
          interactive,
          intensity,
          showRings,
          showSpores,
          showAuraFace,
          audioReactive,
        });
      }
    }, [state, voiceTone, interactive, intensity, showRings, showSpores, showAuraFace, audioReactive]);

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
);
