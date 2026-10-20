# 🥷 Krizaka Motion

> **Next-generation generative canvas, 3D, particle systems & audio-visual synthesis for the Krizaka ecosystem.**
> Drop-in replacement for the Orazaka foundation engine flow on [krizaka.com](https://krizaka.com), 3D acoustic voice presence for [dev.yororis.com](https://dev.yororis.com), Jarvis-inspired Iron Man Mark LXXXV holographic HUD, liquid glass chromatic caustics, and quantum neural synapse lattice.

[![CI](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-f97316)](https://krizaka.com)
[![Krizaka UI](https://img.shields.io/badge/@krizaka/ui-compatible-2563eb)](https://ui.krizaka.com)
[![Tests](https://img.shields.io/badge/tests-15%20passing-emerald)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6)](package.json)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-krizaka.github.io%2Fkrizaka--motion-orange?style=for-the-badge&logo=github)](https://krizaka.github.io/krizaka-motion/)

---

## 🌐 Interactive Live Demo & Showcase

Experience all generative engines, particle physics solvers, and Krizaka UI integrations in real time:

🔗 **[Open Interactive Live Demo (GitHub Pages) →](https://krizaka.github.io/krizaka-motion/)**

| Interactive Demo Tab | REST Route (Shareable Link) | Key Capabilities to Test | Live Interactive Controls |
| :--- | :--- | :--- | :--- |
| **Orazaka Engine Flow** | [`/orazaka`](https://krizaka.github.io/krizaka-motion/orazaka) | Neural packet routing, foundation core convergence | Direction (L-to-R, R-to-L, Top-to-Bottom, Radial), Flow mode (Inbound, Outbound, Bi-directional), Node Vector Icon & label customizer, Particle density |
| **Yororis Voice Presence** | [`/yororis`](https://krizaka.github.io/krizaka-motion/yororis) | Generative vocal empathy & acoustic breathing sphere | Real microphone Web Audio FFT analysis, 4 Voice tones (Léa 216Hz, Theta 432Hz, Solfeggio 528Hz, Aurora 639Hz), Bioluminescent spore swarm, Facial gaze tracking |
| **Jarvis Holographic HUD** | [`/jarvis`](https://krizaka.github.io/krizaka-motion/jarvis) | Iron Man Mark LXXXV tactical combat & diagnostic HUD | Interactive click-to-lock ballistic targeting, Tactical flight modes (Standard, Combat, Stealth, Overdrive), Energy shunt routing, 3D gyro perspective |
| **Liquid Glass Caustics** | [`/liquid-glass`](https://krizaka.github.io/krizaka-motion/liquid-glass) | Snell's law refraction & chromatic dispersion | Fluid mediums (Glass n=1.52, Mercury n=1.95, Water n=1.33, Helium n=1.03), Hydrodynamic pulse trigger, Optical background distortion |
| **Neural Synapse Lattice** | [`/neural-lattice`](https://krizaka.github.io/krizaka-motion/neural-lattice) | Hodgkin-Huxley membrane action potentials & plasticity | Action potential voltage trigger (-70mV to +30mV), Synaptic cascade avalanche, Cognitive brand clusters (Orazaka, Yororis, Jarvis) |
| **Krizaka UI + Motion** | [`/krizaka-ui`](https://krizaka.github.io/krizaka-motion/krizaka-ui) | `@krizaka/ui` npm components augmented with physics | Interactive Cards, Cut-shape Buttons, Status Chips & Badges with kinetic springs & reactive motion |
| **Mobile Architecture** | [`/specs`](https://krizaka.github.io/krizaka-motion/specs) | Zero-bloat React Native Skia & mobile integration | Touch gestures, frame budget telemetry, unit test coverage and mathematical formulas |

---

## 1. Overview & Architecture Philosophy

`@krizaka/motion` is the official real-time visual effects, particle physics, and audio-visual synthesis library for the Krizaka ecosystem.

Built to break away from generic AI/vibe-coding patterns, it provides physical kinetic textures, authentic differential equations, and architectural mineral palettes:

1. **"Krizaka UI First" Governance Rule**: Animations integrate directly with `@krizaka/ui`'s unified motion system (`@krizaka/ui/motion`, `MotionObserver`). No competing requestAnimationFrame loops: all animations listen to `html[data-motion="ready"]`, automatically pause when out of the viewport (`[data-offscreen]`), and fall back to crisp static vector rendering under `prefers-reduced-motion: reduce`.
2. **Second-Order Differential Spring Physics (`SpringSolver`)**: Replaces simplistic linear or cubic easing curves with true physical equations of mass, stiffness, velocity, and critical damping.
3. **Full Portability (React & React Native)**: Mathematical engines decoupled from DOM state, lightweight with zero bloated 3D dependencies, running 60–120 FPS Canvas 2D/WebGL on Web (Next.js) and Mobile (React Native Skia & WebView).
4. **100% npm Dependency Integrity**: `@krizaka/ui`, `@krizaka/tokens`, and `@krizaka/motion` are consumed directly from published packages on npm with no local copies or monorepo symlink leaks.

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     KRIZAKA ECOSYSTEM                                      │
├─────────────────────┬─────────────────────┬────────────────────┬───────────────────────────┤
│ ORAZAKA NEURAL FLOW │  YORORIS VOICE ORB  │ JARVIS HOLOGRAPHIC │ LIQUID CHROMATIC CAUSTICS │
│  (krizaka.com/core) │  (dev.yororis.com)  │  (Iron Man Mark 85)│       (Spatial UX)        │
├─────────────────────┴─────────────────────┴────────────────────┴───────────────────────────┤
│             @krizaka/motion CORE (Second-Order Springs, Bezier, Perlin, Snell, Audio)      │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                    @krizaka/ui (Tokens, MotionObserver, Design System)                     │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components

### 2.1 Orazaka Neural Convergence Flow (`<OrazakaEngineFlow />`)
*Drop-in replacement for the current static/SVG visualizer on [krizaka.com](https://krizaka.com) (`ProductVisuals.tsx`)*.

- **Configurable Flow Directions & Topologies**:
  - `direction="left-to-right"`: Product sources on the left, Orazaka on the right (Krizaka Standard).
  - `direction="right-to-left"`: Product sources on the right, Orazaka on the left.
  - `direction="top-to-bottom"`: Product sources on top, Orazaka at the bottom.
  - `direction="radial"`: Sources arranged in a concentric orbital ring around Orazaka.
- **Bi-directional Request Routing (`flowMode`)**:
  - `inbound`: Ingestion requests from products towards Orazaka.
  - `outbound`: Model inference and analytics dispatched back to products.
  - `bidirectional`: Simultaneous two-way traffic with differential photon coloring.
- **Customizable Vector Icons & Labels**:
  - Each product node renders customizable vector badges (`doc`, `video`, `chart`, `calendar`, `chat`, `voice`, `brain`, `cpu`, `shield`, `zap`).
  - Labels, subtitles, and telemetry are dynamic and editable live via the interactive node inspector.
- **Particle & Conduit Styles**:
  - `particleStyle`: `photons` (glowing spheres), `data-blocks` (hexadecimal byte packets `0x9F`), `beams` (laser trajectories).
  - `conduitStyle`: `smooth-bezier` (fluid S-curves), `straight` (direct laser), `cyber-grid` (90° PCB traces).

```tsx
import { OrazakaEngineFlow } from "@krizaka/motion";

export function Engine({ playing }: { playing: boolean }) {
  return (
    <OrazakaEngineFlow
      playing={playing}
      direction="left-to-right"
      flowMode="bidirectional"
      particleStyle="photons"
      conduitStyle="smooth-bezier"
      showTelemetry
      particleDensity={1.2}
      className="pv-engine-nextgen"
    />
  );
}
```

---

### 2.2 Yororis Acoustic Voice & Harmonic Sphere (`<YororisPresenceOrb />`)
*Generative vocal presence, empathy, and calming space for [dev.yororis.com](https://dev.yororis.com)*.

- **Real-Time Microphone Frequency Analysis (`toggleMicrophone`)**: Real-time Web Audio API capture with FFT decomposition matching human vocal formants.
- **Bioluminescent Spore Cloud (`showSpores`)**: Ambient Brownian spore swarm floating dynamically around the acoustic sphere.
- **Facial Empathy Gaze Tracking (`showAuraFace`)**: Soft facial presence halo tracking mouse focus or user presence.
- **4 Harmonic Voice Profiles (`voiceTone`)**:
  - `lea`: 216 Hz — Léa's signature fundamental frequency F0 (calming grounding tone).
  - `theta`: 432 Hz — Theta brainwave entrainment and deep relaxation.
  - `solfeggio`: 528 Hz — Transformation frequency and somatic restoration.
  - `aurora`: 639 Hz — Interpersonal resonance and clinical empathy.
- **Clinical 4-7-8 Breathing Pacer**: 4s ventral inhale, 7s gentle retention, 8s slow exhale with rhythmic visual guidance.
- **Built-in Procedural Audio Drone**: Pure binaural harmonic frequencies generated without external audio files.

```tsx
import { YororisPresenceOrb, type YororisPresenceOrbHandle } from "@krizaka/motion";
import { useRef } from "react";

export function YororisVoiceSpace() {
  const orbRef = useRef<YororisPresenceOrbHandle>(null);

  const startLiveAnalysis = async () => {
    await orbRef.current?.toggleMicrophone(true);
  };

  return (
    <YororisPresenceOrb
      ref={orbRef}
      state="speaking"
      voiceTone="lea"
      enableAudio={true}
      showSpores={true}
      showAuraFace={true}
      showRings={true}
    />
  );
}
```

---

### 2.3 Jarvis Holographic HUD (`<JarvisHUD />`)
*Cinema-grade Iron Man Mark LXXXV tactical combat holographic HUD*.

- **Interactive Click-to-Lock Target Acquisition (`lockTargetAt`)**: Click anywhere on the interface to acquire ballistic coordinates with real-time distance tracking, approach vectors, and threat assessment (`CRITICAL`, `ELEVATED`, `MINIMAL`).
- **4 Tactical Combat Modes (`tacticalMode`)**:
  - `standard`: Cruising flight telemetry and navigation.
  - `combat`: Rapid engagement reticle and nanotech weaponry.
  - `stealth`: Low-signature radar absorption with dimmed emitters.
  - `overdrive`: Max Arc Reactor unibeam discharge with crimson alert strobing.
- **Arc Reactor Energy Shunt Matrix**: Live monitoring of power allocation to repulsors (85%), nanotech shields (94%), central unibeam (60%), and thrusters (78%).
- **Multi-Plane 3D Gyroscopic Projection**: Real-time perspective tilt of 7 concentric rings based on pointer or mobile gyroscope input.

```tsx
import { JarvisHUD, type JarvisHUDHandle } from "@krizaka/motion";
import { useRef } from "react";

export function IronManCore() {
  const hudRef = useRef<JarvisHUDHandle>(null);

  return (
    <JarvisHUD
      ref={hudRef}
      theme="cyan"
      tacticalMode="combat"
      interactive3D={true}
      rotationSpeed={1.0}
      showDiagnostics={true}
      showEnergyMatrix={true}
      onTargetLocked={(target) => console.log("Target locked:", target)}
    />
  );
}
```

---

### 2.4 Liquid Glass Caustics & Snell Refraction (`<LiquidCausticsView />`)
*Spatial UX tactile design based on Snell's optical refraction law and Navier-Stokes viscous damping*.

- **Physical Fluid Mediums (`fluidMedium`)**:
  - `glass`: Borosilicate glass ($n = 1.52$) — crisp caustic highlights and mineral facets.
  - `water`: Fresh water ($n = 1.33$) — soft swells and gentle surface ripples.
  - `mercury`: Liquid metal mercury ($n = 1.95$) — extreme surface tension and high reflectivity.
  - `helium`: Superfluid helium ($n = 1.03$) — ultra-light quantum dispersion.
- **Underlying Typography Optical Distortion (`showUnderlyingText`)**: Text and UI components placed beneath the fluid layer undergo real-time chromatic RGB refraction.
- **Navier-Stokes Damping & Impulse Waves**: Realistic hydrodynamic wave propagation triggered by pointer velocity or programmatic shocks.

```tsx
import { LiquidCausticsView, type LiquidCausticsViewHandle } from "@krizaka/motion";
import { useRef } from "react";

export function SpatialGlassPanel() {
  const causticsRef = useRef<LiquidCausticsViewHandle>(null);

  return (
    <LiquidCausticsView
      ref={causticsRef}
      palette="amber"
      fluidMedium="glass"
      refractionStrength={1.2}
      viscosity={0.98}
      showUnderlyingText={true}
    />
  );
}
```

---

### 2.5 Quantum Neural Synapse Lattice (`<NeuralLatticeView />`)
*Hodgkin-Huxley computational neuro-simulation for Orazaka and Yororis cognitive connections*.

- **Membrane Potential Action Dynamics**: Simulates membrane potential fluctuations from -70 mV to +30 mV with saltatory synaptic transmission.
- **Hebbian Synaptic Plasticity (`enableHebbianPlasticity`)**: *"Neurons that fire together, wire together"* — repeatedly activated synapses strengthen their conductance and optical caliber over time.
- **Synchronous Neuro-Cascade Avalanche (`triggerCascadeAvalanche`)**: Trigger synchronized depolarization waves across the entire network.
- **Cognitive Brand Clusters**:
  - `Orazaka Core` (Brand Orange `#f97316`)
  - `Yororis Empathy` (Brand Sage `#7c9082`)
  - `Jarvis Hologram` (Brand Cyan `#00f0ff`)

```tsx
import { NeuralLatticeView, type NeuralLatticeViewHandle } from "@krizaka/motion";
import { useRef } from "react";

export function SynapseBoard() {
  const latticeRef = useRef<NeuralLatticeViewHandle>(null);

  return (
    <NeuralLatticeView
      ref={latticeRef}
      nodeCount={52}
      enableHebbianPlasticity={true}
      theme="obsidian-gold"
    />
  );
}
```

---

## 3. How to Use @krizaka/motion with @krizaka/ui

> **Core Governance Principle**: `@krizaka/ui` and `@krizaka/motion` are installed strictly from **npm**. No repository cloning, no local symlinks, and zero duplicated animation conductors.

### 3.1 Install via npm

```bash
pnpm add @krizaka/ui @krizaka/tokens @krizaka/motion
```

### 3.2 Recipe 1: Glassmorphism Card with Caustic Backdrop

Position the `LiquidCausticsView` in `absolute inset-0` behind the `@krizaka/ui/card` component:

```tsx
import React from "react";
import { Card } from "@krizaka/ui/card";
import { Button } from "@krizaka/ui/button";
import { Badge } from "@krizaka/ui/badge";
import { LiquidCausticsView } from "@krizaka/motion";

export function MotionGlassCard() {
  return (
    <Card.Root className="relative overflow-hidden border border-amber-500/30 rounded-2xl bg-[#0c0d10]/90">
      {/* Background reactive krizaka-motion canvas */}
      <div className="absolute inset-0 pointer-events-auto opacity-50">
        <LiquidCausticsView palette="amber" fluidMedium="glass" />
      </div>

      {/* Foreground Krizaka UI content */}
      <Card.Body className="relative z-10 p-6 space-y-4 backdrop-blur-[2px]">
        <Badge tone="accent">Liquid Glass</Badge>
        <Card.Title className="text-xl font-bold text-white">
          Spatial Refractive Interface
        </Card.Title>
        <Card.Description className="text-sm text-zinc-400">
          This @krizaka/ui card component reflects Snell optical refraction upon cursor interaction.
        </Card.Description>
        <Card.Footer className="pt-2">
          <Button variant="primary" shape="cut">
            Confirm Action
          </Button>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
}
```

### 3.3 Recipe 2: Chamfered Button with Second-Order Spring Physics

Apply the `SpringSolver` physics engine to the chamfered cut buttons of `@krizaka/ui/button` (`shape="cut"`):

```tsx
import React, { useRef, useState } from "react";
import { Button } from "@krizaka/ui/button";
import { SpringSolver } from "@krizaka/motion/core";

export function KineticSpringButton() {
  const [offsetY, setOffsetY] = useState(0);
  const spring = useRef(new SpringSolver({ stiffness: 280, damping: 22, mass: 1 }));

  return (
    <Button
      variant="primary"
      shape="cut"
      size="lg"
      onPointerDown={() => spring.current.setTarget(4)}
      onPointerUp={() => spring.current.setTarget(0)}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      Kinetic Spring Button
    </Button>
  );
}
```

### 3.4 Recipe 3: Acoustic Voice Bubble with Metric Chips

Embed the harmonic presence sphere inside dialogue bubbles using `@krizaka/ui/chip`:

```tsx
import React from "react";
import { Chip } from "@krizaka/ui/chip";
import { YororisPresenceOrb } from "@krizaka/motion";

export function YororisVoiceMessage() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#090d0b] border border-[#7c9082]/30">
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
        <YororisPresenceOrb state="speaking" voiceTone="lea" showSpores={false} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Léa · Vocal Presence</span>
          <Chip size="sm">216 Hz F0</Chip>
        </div>
        <p className="text-xs text-[#b8c5b9] mt-0.5">
          "Take a slow, deep breath into your lower abdomen..."
        </p>
      </div>
    </div>
  );
}
```

---

## 4. React Native Integration (Mobile)

For integrating these visual engines into Krizaka mobile applications (`orazaka-mobile`, `yororis-mobile`, `orochia-mobile`), two options are provided:

### Option 1: Ultra-Lightweight WebView Adapter (Zero Native Configuration)
```tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { generateNativeWebViewHTML } from "@krizaka/motion/native";

export function MobileOrazakaEngine() {
  const html = generateNativeWebViewHTML("engine", { 
    direction: "left-to-right",
    flowMode: "bidirectional" 
  });
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 260, borderRadius: 14, overflow: "hidden" },
  webview: { backgroundColor: "transparent" },
});
```

### Option 2: Skia Native Canvas (`@shopify/react-native-skia`)
All data structures in `src/core/types.ts` emit pure mathematical coordinates (points, Bézier curves, frequencies), transposable directly into `SkCanvas` commands (`canvas.drawCircle`, `canvas.drawPath`).

---

## 5. Running the Interactive Demo Locally

To launch the full interactive testbed with all animations running in real time:

```bash
# Inside products/krizaka-motion
pnpm install
pnpm run dev
```

Open `http://localhost:5173` to explore the directional pipeline selector, node customizer, Krizaka UI showcase, Jarvis holographic HUD, liquid glass caustics, real-time microphone analysis, and live FPS counter.

---

## 6. Scripts & Test Suite

- `pnpm run dev`: Launch the Vite development server with the interactive showcase.
- `pnpm run test`: Run the test suite (15 unit tests covering spring physics, Bézier math, Snell refraction, Hodgkin-Huxley potentials, and color token contrast).
- `pnpm run build`: Compile the dual CJS/ESM library bundle (`dist/`), TypeScript declaration files (`.d.ts`), and static demo (`dist-demo/`).
- `pnpm run typecheck`: Run strict TypeScript validation (`tsc --noEmit`).
- `pnpm run preview`: Preview the production demo bundle locally.

---

## 7. License

[Apache-2.0](LICENSE) — see [NOTICE](NOTICE).

<sub>Engineered with precision for the Krizaka ecosystem · [krizaka.com](https://www.krizaka.com)</sub>
