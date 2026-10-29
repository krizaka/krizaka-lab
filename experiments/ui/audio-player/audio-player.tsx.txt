// Client. An `<audio>` with a waveform you can seek on: the bars are the sound's peaks (given by the server, or
// computed here from the file with Web Audio when `computePeaks` — once, on demand), the played part in the accent.
// The waveform is a `slider` (arrows ± 5 s, Page keys ± 30 s, Home / End) whose value is read as a time; the play
// button and the speed are named by props. No animation but the played part's colour, and it pauses off screen.
import * as React from "react";
import { tv } from "tailwind-variants";

import { PauseGlyph, PlayGlyph } from "../glyphs";
import { clamp, formatClock, playSafely, useInView } from "../media";
import { resamplePeaks } from "../waveform/bars";

export { resamplePeaks };

export const audioPlayer = tv({
  slots: {
    root: "flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-1 p-3",
    play:
      "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-hover " +
      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1",
    body: "flex min-w-0 flex-1 flex-col gap-1",
    title: "truncate text-sm font-semibold text-fg",
    wave:
      "relative flex h-10 w-full cursor-pointer touch-none items-center gap-[2px] rounded-md " +
      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
    bar: "min-w-[2px] flex-1 rounded-full bg-border-strong data-[played]:bg-accent",
    meta: "flex items-center justify-between font-mono text-[11px] tabular-nums text-fg-secondary",
    speed:
      "shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums text-fg-secondary hover:bg-surface-3 hover:text-fg " +
      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
  },
});

export type AudioPlayerLabels = {
  play: string;
  pause: string;
  /** The waveform slider ("Seek"). */
  seek: string;
  /** The speed button: `(rate) => "Speed " + rate + "×"`. */
  speed: (rate: number) => string;
  /** The slider's value: `(time, duration) => "0:42 of 3:10"`. */
  time: (time: string, duration: string) => string;
};

export const audioPlayerLabels: AudioPlayerLabels = {
  play: "Play",
  pause: "Pause",
  seek: "Seek",
  speed: (rate) => `Speed ${rate}×`,
  time: (time, duration) => `${time} of ${duration}`,
};

export type AudioPlayerProps = {
  /** The address of the sound. */
  src: string;
  /** What it is ("Voice note — Eric, 0:42"): shown, and the accessible name of the player. */
  title: string;
  /** The peaks, between 0 and 1, as many as you like (they are resampled to `bars`). */
  peaks?: readonly number[];
  /** Without `peaks`: fetches the file and computes them with Web Audio at the first play (same-origin or CORS). */
  computePeaks?: boolean;
  /** How many bars. Default 48. */
  bars?: number;
  /** The speeds of the speed button. Default `[1, 1.5, 2]`; `[]` hides it. */
  playbackRates?: readonly number[];
  /** Pauses when it leaves the screen. Default `true`. */
  pauseWhenHidden?: boolean;
  /** The length, in seconds, before the metadata is loaded (from the server). */
  duration?: number;
  /** Called when playback starts, pauses, ends. */
  onPlayingChange?: (playing: boolean) => void;
  /** The words, passed translated; English by default. */
  labels?: Partial<AudioPlayerLabels>;
  /** Classes merged on the root. */
  className?: string;
};

/** The peaks of a sound file, computed with Web Audio (`count` of them). */
export async function computeAudioPeaks(src: string, count = 200, signal?: AbortSignal): Promise<number[]> {
  const response = await fetch(src, { signal });
  const data = await response.arrayBuffer();
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const context = new Context();
  try {
    const buffer = await context.decodeAudioData(data);
    const channel = buffer.getChannelData(0);
    const size = Math.max(1, Math.floor(channel.length / count));
    return Array.from({ length: count }, (_, i) => {
      let peak = 0;
      for (let j = i * size; j < Math.min(channel.length, (i + 1) * size); j += 1) peak = Math.max(peak, Math.abs(channel[j]!));
      return peak;
    });
  } finally {
    void context.close();
  }
}

/** A sound with a seekable waveform: play / pause, time, speed — a voice note, a podcast clip, a track. */
export function AudioPlayer({
  src,
  title,
  peaks: given,
  computePeaks,
  bars = 48,
  playbackRates = [1, 1.5, 2],
  pauseWhenHidden = true,
  duration: knownDuration = 0,
  onPlayingChange,
  labels: words,
  className,
}: AudioPlayerProps) {
  const labels = { ...audioPlayerLabels, ...words };
  const s = audioPlayer();
  const audio = React.useRef<HTMLAudioElement>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const wave = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(knownDuration);
  const [rate, setRate] = React.useState(playbackRates[0] ?? 1);
  const [computed, setComputed] = React.useState<number[] | null>(null);
  const [wantPeaks, setWantPeaks] = React.useState(false);

  React.useEffect(() => {
    if (given || !computePeaks || !wantPeaks) return;
    const controller = new AbortController();
    computeAudioPeaks(src, 200, controller.signal).then(setComputed, () => undefined);
    return () => controller.abort();
  }, [given, computePeaks, wantPeaks, src]);

  useInView(root, (visible) => !visible && audio.current && !audio.current.paused && audio.current.pause(), pauseWhenHidden);

  const shape = React.useMemo(() => resamplePeaks(given ?? computed ?? [], bars), [given, computed, bars]);
  const progress = duration > 0 ? time / duration : 0;

  const seek = (to: number) => {
    if (!audio.current) return;
    const next = clamp(to, 0, duration || audio.current.duration || 0);
    audio.current.currentTime = next;
    setTime(next);
  };
  const at = (clientX: number) => {
    const box = wave.current?.getBoundingClientRect();
    return box && box.width ? ((clientX - box.left) / box.width) * duration : 0;
  };
  const toggle = () => {
    setWantPeaks(true);
    if (!audio.current) return;
    if (audio.current.paused) playSafely(audio.current);
    else audio.current.pause();
  };

  return (
    <div ref={root} role="group" aria-label={title} className={s.root({ className })}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          onPlayingChange?.(true);
        }}
        onPause={() => {
          setPlaying(false);
          onPlayingChange?.(false);
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => Number.isFinite(event.currentTarget.duration) && setDuration(event.currentTarget.duration)}
      />
      <button type="button" className={s.play()} aria-label={playing ? labels.pause : labels.play} onClick={toggle}>
        {playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="ml-0.5 h-5 w-5" />}
      </button>
      <div className={s.body()}>
        <p className={s.title()} aria-hidden>
          {title}
        </p>
        <div
          ref={wave}
          role="slider"
          tabIndex={0}
          aria-label={labels.seek}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={labels.time(formatClock(time), formatClock(duration))}
          className={s.wave()}
          onPointerDown={(event) => {
            dragging.current = true;
            wave.current?.setPointerCapture?.(event.pointerId);
            seek(at(event.clientX));
          }}
          onPointerMove={(event) => dragging.current && seek(at(event.clientX))}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onKeyDown={(event) => {
            const moves: Record<string, number> = {
              ArrowLeft: time - 5,
              ArrowDown: time - 5,
              ArrowRight: time + 5,
              ArrowUp: time + 5,
              PageDown: time - 30,
              PageUp: time + 30,
              Home: 0,
              End: duration,
            };
            const to = moves[event.key];
            if (to === undefined) return;
            event.preventDefault();
            seek(to);
          }}
        >
          {shape.map((peak, i) => (
            <span key={i} aria-hidden data-played={(i + 0.5) / bars <= progress ? "" : undefined} className={s.bar()} style={{ height: `${Math.round(peak * 100)}%` }} />
          ))}
        </div>
        <div className={s.meta()} aria-hidden>
          <span>{formatClock(time)}</span>
          <span>{formatClock(duration)}</span>
        </div>
      </div>
      {playbackRates.length > 1 && (
        <button
          type="button"
          className={s.speed()}
          aria-label={labels.speed(rate)}
          onClick={() => {
            const next = playbackRates[(playbackRates.indexOf(rate) + 1) % playbackRates.length] ?? 1;
            if (audio.current) audio.current.playbackRate = next;
            setRate(next);
          }}
        >
          {rate}×
        </button>
      )}
    </div>
  );
}
