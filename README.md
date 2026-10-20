# 🥷 Krizaka Motion

> **Next-generation generative canvas, 3D, particle systems & audio-visual synthesis for the Krizaka ecosystem.**
> Drop-in replacement for the Orazaka foundation engine flow on [krizaka.com](https://krizaka.com), 3D acoustic voice presence for [dev.yororis.com](https://dev.yororis.com), Jarvis-inspired Iron Man holographic HUD, liquid glass chromatic caustics, and neural synapse lattice.

[![CI](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml/badge.svg)](https://github.com/krizaka/krizaka-motion/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-f97316)](https://krizaka.com)
[![Krizaka UI](https://img.shields.io/badge/@krizaka/ui-compatible-2563eb)](https://ui.krizaka.com)
[![Tests](https://img.shields.io/badge/tests-passing-emerald)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6)](package.json)

---

## 1. Vue d'ensemble & Philosophie

`krizaka-motion` est la bibliothèque d'effets visuels, de physique particulaire et de synthèse audio-visuelle temps réel pour les produits de l'écosystème Krizaka.

Elle a été conçue pour briser les codes du "vibe coding" standard en proposant des textures cinétiques authentiques, une physique différentielle réelle et des palettes minérales architecturales :
1. **La règle « Krizaka UI d'abord »** : Les animations s'intègrent directement dans le système de mouvement commun de `@krizaka/ui` (`@krizaka/ui/motion`, `MotionObserver`). Pas de boucle RAF concurrente : les animations respectent `html[data-motion="ready"]`, se mettent en pause instantanément hors écran (`[data-offscreen]`) et basculent sur un rendu statique soigné sous `prefers-reduced-motion: reduce`.
2. **Physique Différentielle du Second Ordre (`SpringSolver`)** : Élimination des courbes `ease` linéaires ou cubiques simplistes au profit de véritables équations physiques d'inertie, de rebond élastique et d'amortissement critique.
3. **Portabilité Totale (React & React Native)** : Moteurs mathématiques découplés du DOM, légers (zéro dépendance lourde 3D externe), exécutant des calculs de flux en Canvas 2D/WebGL natif à 60-120 FPS sur Web (Next.js) et Mobile (React Native Skia & WebView).

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ÉCOSYSTÈME KRIZAKA                                       │
├─────────────────────┬─────────────────────┬────────────────────┬───────────────────────────┤
│ ORAZAKA NEURAL FLOW │ YORORIS VOICE ORB   │ JARVIS HOLOGRAPHIC │ LIQUID CHROMATIC CAUSTICS │
│  (krizaka.com/core) │  (dev.yororis.com)  │  (Iron Man Mark 85)│      (Spatial UX)         │
├─────────────────────┴─────────────────────┴────────────────────┴───────────────────────────┤
│             @krizaka/motion CORE (Second-Order Springs, Bezier, Perlin, Snell, Audio)      │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                    @krizaka/ui (Tokens, MotionObserver, Design System)                     │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Les Composants Majeurs

### 2.1 Orazaka Neural Convergence Flow (`<OrazakaEngineFlow />`)
*Remplacement direct de l'animation SVG actuelle sur [krizaka.com](https://krizaka.com) (`ProductVisuals.tsx`)*.

- **Direction & Topologie Paramétrables** :
  - `direction="left-to-right"` : Sources à gauche, Orazaka à droite (Standard Krizaka).
  - `direction="right-to-left"` : Sources à droite, Orazaka à gauche.
  - `direction="top-to-bottom"` : Sources en haut, Orazaka en bas.
  - `direction="radial"` : Sources disposées en couronne circulaire orbitant autour d'Orazaka.
- **Routage Bi-directionnel des Requêtes (`flowMode`)** :
  - `inbound` : Requêtes des produits vers Orazaka.
  - `outbound` : Inférences et réponses envoyées aux produits.
  - `bidirectional` : Requêtes et flux de retours simultanés avec colorimétrie différentielle.
- **Icônes et Libellés Personnalisables** :
  - Chaque nœud peut porter son icône vectorielle (`doc`, `video`, `chart`, `calendar`, `chat`, `voice`, `brain`, `cpu`, `shield`, `zap`).
  - Libellés et sous-titres configurables (`nodeConfigs`), éditables en direct via l'inspecteur interactif.
- **Styles de Particules & Conduits** :
  - `particleStyle` : `photons` (sphères luminescentes), `data-blocks` (paquets hexadécimaux `0x9F`), `beams` (faisceaux lasers).
  - `conduitStyle` : `smooth-bezier` (courbes S fluides), `straight` (lignes laser), `cyber-grid` (traces PCB à 90°).

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
      theme="cyan"
      interactive3D={true}
      overdrive={false}
      rotationSpeed={1.0}
      showDiagnostics={true}
    />
  );
}
```

---

### 2.4 Caustiques Fluides & Réfraction Chromatique (`<LiquidCausticsView />`)
*Design spatial tactile inspiré de la réfraction optique physique (loi de Snell-Descartes)*.

- **Dispersion de Longueur d'Onde** : Séparation chromatique RGB naturelle le long des crêtes de fluides (`IOR: 1.51 - 1.53`).
- **Amortissement Visqueux de Navier-Stokes** : Ondulations réactives au curseur et aux clics avec tension de surface.
- **Palettes Minérales Architecturales** :
  - *Obsidian Titanium* : Encres minérales sombres, titane brut et éclats d'ambre bioluminescent.
  - *Prussian Mineral* : Bleu prussien profond, blanc sel et reflets émeraude.
  - *Yororis Quartz* : Quartz sableux, sauge et pierre de rivière.
  - *Bioluminescent Amber* : Braises ambrées et plasma chaud.

---

### 2.5 Maillage Synaptique Quantique (`<NeuralLatticeView />`)
*Visualisation des connexions cognitives d'Orazaka et Yororis*.

- Topologie dynamique Delaunay & K-NN avec propagation d'impulsions (potentiels d'action).
- Champ d'excitation magnétique réactif au curseur de souris.

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

### Option 2 : Moteur Natif Skia (`@shopify/react-native-skia`)
Toutes les structures de données (`src/core/types.ts`) fournissent des coordonnées pures (points, chemins de Bézier, fréquences), transposables directement en primitives `SkCanvas` (`canvas.drawCircle`, `canvas.drawPath`).

---

## 5. Démarrage de la Démo Interactive Locale

Pour lancer le banc d'essai interactif complet avec toutes les animations en temps réel :

```bash
# Dans le dossier products/krizaka-motion
pnpm install
pnpm run dev
```

L'application de démo s'ouvre sur `http://localhost:5173` avec les commandes interactives, les sélecteurs de direction, le configurateur d'icônes et libellés, les thèmes de Jarvis, les caustiques de verre liquide, le drone sonore de Yororis et le compteur d'images par seconde (FPS).

---

## 6. Scripts & Tests Unitaires

- `pnpm run dev` : Lance le serveur de développement Vite avec l'application de démonstration.
- `pnpm run test` : Exécute la suite de tests unitaires (solveur de ressorts physiques, calculs de Bézier, validation des tokens de couleurs).
- `pnpm run build` : Compile la bibliothèque (`dist/`), les types TypeScript (`.d.ts`), et l'application démo (`dist-demo/`).
- `pnpm run typecheck` : Vérifie la rigueur du typage TypeScript sans émettre de fichiers.
- `pnpm run preview` : Prévisualise le build de production localement.

---

## 7. Licence

[Apache-2.0](LICENSE) — voir [NOTICE](NOTICE).

<sub>Fait avec passion pour l'écosystème Krizaka · [krizaka.com](https://www.krizaka.com)</sub>
