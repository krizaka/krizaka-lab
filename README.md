# 🥷 Krizaka Motion

> **Next-generation generative canvas, 3D, particle systems & audio-visual synthesis for the Krizaka ecosystem.**
> Drop-in replacement for the Orazaka foundation engine flow on [krizaka.com](https://krizaka.com), 3D acoustic voice presence for [dev.yororis.com](https://dev.yororis.com), and Jarvis-inspired Iron Man holographic HUD.

[![CI](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-f97316)](https://krizaka.com)
[![Krizaka UI](https://img.shields.io/badge/@krizaka/ui-compatible-2563eb)](https://ui.krizaka.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6)](package.json)

---

## 1. Vue d'ensemble & Philosophie

`krizaka-motion` est la bibliothèque d'effets visuels, de physique particulaire et de synthèse audio-visuelle temps réel pour les produits de l'écosystème Krizaka.

Elle a été conçue selon deux principes cardinaux :
1. **La règle « Krizaka UI d'abord »** : Les animations s'intègrent directement dans le système de mouvement commun de `@krizaka/ui` (`@krizaka/ui/motion`, `MotionObserver`). Pas de boucle RAF concurrente : les animations respectent `html[data-motion="ready"]`, se mettent en pause instantanément hors écran (`[data-offscreen]`) et basculent sur un rendu statique soigné sous `prefers-reduced-motion: reduce`.
2. **Portabilité Totale (React & React Native)** : Moteurs mathématiques découplés du DOM, légers (zéro dépendance lourde 3D externe type Three.js géant), exécutant des calculs de flux en Canvas 2D/WebGL natif à 60-120 FPS sur Web (Next.js) et Mobile (React Native Skia & WebView).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ÉCOSYSTÈME KRIZAKA                            │
├─────────────────────────┬─────────────────────────┬────────────────────┤
│   ORAZAKA NEURAL FLOW   │  YORORIS ACOUSTIC ORB   │ JARVIS HOLOGRAPHIC │
│ (krizaka.com/foundation)│   (dev.yororis.com)     │  (Iron Man Mark 85)│
├─────────────────────────┴─────────────────────────┴────────────────────┤
│          @krizaka/motion CORE (Physics, Bezier, Perlin, Audio)         │
├────────────────────────────────────────────────────────────────────────┤
│           @krizaka/ui (Tokens, MotionObserver, Design System)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Les Trois Composants Majeurs

### 2.1 Orazaka Neural Convergence Flow (`<OrazakaEngineFlow />`)
*Remplacement direct de l'animation SVG actuelle sur [krizaka.com](https://krizaka.com) (`ProductVisuals.tsx`)*.

- **Flux Quantique Multicanal** : Relie les 6 produits Krizaka (Yomizaka, Orochia, Kachizaka, Akinaza, Yasakia, Yororis) au réacteur central Orazaka via des trajectoires de Bézier cubiques fluides.
- **Physique Particulaire & Absorption** : Des photons de requêtes AI voyagent le long des canaux, pénètrent le cœur Orazaka et déclenchent des ondes de choc concentriques avec rebond élastique physique.
- **Interactivité & Télémétrie** : Survoler une source isole son pipeline, affiche la latence simulée (`req_id`, `12ms`, `tokens/s`), et le champ magnétique réagit au curseur de la souris.
- **Totalement Responsive** : S'adapte instantanément du mobile 320px au grand écran 4K sans saut de mise en page (CLS 0).

```tsx
import { OrazakaEngineFlow } from "@krizaka/motion";

// Remplacement drop-in dans krizaka-com/app/components/home/visuals/ProductVisuals.tsx
export function Engine({ playing }: { playing: boolean }) {
  return (
    <OrazakaEngineFlow
      playing={playing}
      interactive
      showTelemetry
      particleDensity={1.2}
      className="pv-engine-nextgen"
    />
  );
}
```

---

### 2.2 Yororis Acoustic Voice & Harmonic Sphere (`<YororisPresenceOrb />`)
*Présence vocale et apaisement pour [dev.yororis.com](https://dev.yororis.com)*.

- **Sphère Harmonique 3D Déformable** : Déformation organique par bruit harmonique 3D à plusieurs octaves, représentant le visage et la voix de Léa.
- **4 Modes de Présence Clinique** :
  - `idle` : Repos et écoute calme, respiration harmonique douce (0.2 Hz).
  - `speaking` : Présence vocale dynamique basée sur les formants acoustiques (F0 ~ 216 Hz).
  - `breathing` : Guide respiratoire 4-7-8 (4s inspiration, 7s rétention, 8s expiration) avec halo thérapeutique expansif.
  - `reflecting` : Pulsations synaptiques douces pour le recueillement.
- **Synthèse Sonore Procédurale Intégrée** : Génération audio Web Audio API d'un drone acoustique apaisant avec harmoniques pures.

```tsx
import { YororisPresenceOrb } from "@krizaka/motion";

export function YororisVoiceSpace() {
  return (
    <YororisPresenceOrb
      state="speaking" // "idle" | "listening" | "speaking" | "breathing" | "reflecting"
      enableAudio={true}
      showRings={true}
    />
  );
}
```

---

### 2.3 Jarvis Holographic HUD (`<JarvisHUD />`)
*Interface holographique 3D tactique inspirée du HUD de Jarvis dans Iron Man (Mark LXXXV)*.

- **Réacteur Arc Central** : Cœur de plasma à fusion pulsante, 10 électroaimants de cuivre rotatifs et décharges coronales quantiques.
- **7 Anneaux Concentriques Indépendants** : Échelles angulaires, jauges d'azimut en rotation différentielle, grilles hexagonales et analyseur de spectre radial.
- **Parallaxe 3D Gyroscopique** : L'interface s'incline en 3D temps réel suivant le mouvement de la souris ou l'orientation du smartphone.
- **Mode Overdrive & Palettes** : Alerte rouge vif / crimson avec flash d'urgence et saturation de flux, ou thèmes Stark Cyan, Orazaka Plasma Orange, Yororis Sage et Golden Magpie.

```tsx
import { JarvisHUD } from "@krizaka/motion";

export function IronManCore() {
  return (
    <JarvisHUD
      theme="cyan" // "cyan" | "orazaka" | "yororis" | "crimson" | "gold"
      interactive3D={true}
      overdrive={false}
      rotationSpeed={1.0}
      showDiagnostics={true}
    />
  );
}
```

---

## 3. Installation & Utilisation

```bash
# Dans votre projet Krizaka
pnpm add @krizaka/motion @krizaka/ui @krizaka/tokens
```

---

## 4. Intégration React Native (Mobile)

Pour intégrer ces animations dans les applications mobiles Krizaka (`orazaka-mobile`, `yororis-mobile`, `orochia-mobile`), deux approches sont fournies :

### Option 1 : Adaptateur WebView Ultra-Léger (Zéro configuration native)
```tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { generateNativeWebViewHTML } from "@krizaka/motion/native";

export function MobileOrazakaEngine() {
  const html = generateNativeWebViewHTML("engine", { playing: true });
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

### Option 2 : Moteur Natif Skia (`@shopify/react-native-skia`)
Toutes les structures de données (`src/core/types.ts`) fournissent des coordonnées pures (points, chemins de Bézier, fréquences), transposables directement en primitives `SkCanvas` (`canvas.drawCircle`, `canvas.drawPath`).

---

## 5. Démarrage de la Démo Interactive Locale

Pour lancer le banc d'essai interactif complet avec les trois animations en temps réel :

```bash
# Dans le dossier products/krizaka-motion
pnpm install
pnpm run dev
```

L'application de démo s'ouvre sur `http://localhost:5173` avec les commandes interactives, les curseurs de densité, les thèmes de Jarvis, le drone sonore de Yororis et le compteur d'images par seconde (FPS).

---

## 6. Scripts Disponibles

- `pnpm run dev` : Lance le serveur de développement Vite avec l'application de démonstration.
- `pnpm run build` : Compile la bibliothèque (`dist/`), les types TypeScript (`.d.ts`), et l'application démo (`dist-demo/`).
- `pnpm run typecheck` : Vérifie la rigueur du typage TypeScript sans émettre de fichiers.
- `pnpm run preview` : Prévisualise le build de production localement.

---

## 7. Licence

[Apache-2.0](LICENSE) — voir [NOTICE](NOTICE).

<sub>Fait avec passion pour l'écosystème Krizaka · [krizaka.com](https://www.krizaka.com)</sub>
