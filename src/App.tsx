import React, { useState, useEffect } from "react";
import {
  OrazakaEngineFlow,
  YororisPresenceOrb,
  JarvisHUD,
} from "./react";
import { type ProductId, type YororisState, type JarvisTheme } from "./core/types";
import { PRODUCT_BRANDS, JARVIS_THEMES } from "./core/color-palettes";
import {
  Play,
  Pause,
  Sliders,
  Volume2,
  VolumeX,
  Code2,
  Layers,
  Sparkles,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Activity,
} from "lucide-react";

type TabId = "orazaka" | "yororis" | "jarvis" | "architecture";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("orazaka");
  const [fps, setFps] = useState(60);

  // Orazaka Engine Controls
  const [enginePlaying, setEnginePlaying] = useState(true);
  const [engineDensity, setEngineDensity] = useState(1.2);
  const [engineSpeed, setEngineSpeed] = useState(1.0);
  const [selectedSource, setSelectedSource] = useState<ProductId | null>(null);
  const [showEngineTelemetry, setShowEngineTelemetry] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Yororis Controls
  const [yororisState, setYororisState] = useState<YororisState>("idle");
  const [yororisPlaying, setYororisPlaying] = useState(true);
  const [yororisAudio, setYororisAudio] = useState(false);

  // Jarvis HUD Controls
  const [jarvisTheme, setJarvisTheme] = useState<JarvisTheme>("cyan");
  const [jarvisOverdrive, setJarvisOverdrive] = useState(false);
  const [jarvis3D, setJarvis3D] = useState(true);
  const [jarvisSpeed, setJarvisSpeed] = useState(1.0);

  // Real-time FPS monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };
    animId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animId);
  }, []);

  const copyDropInCode = () => {
    const code = `import { OrazakaEngineFlow } from "@krizaka/motion";

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
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f0f2f5] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#1e2227] bg-[#0c0d0f]/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shadow-[0_0_12px_rgba(249,115,22,0.25)]">
            kz
          </div>
          <div>
            <h1 className="font-semibold text-sm md:text-base tracking-tight flex items-center gap-2">
              Krizaka Motion
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-[#88929e] hidden sm:block">
              Generative visual synthesis & responsive motion for the Krizaka ecosystem
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#14171a] p-1 rounded-xl border border-[#262b32]">
          <button
            onClick={() => setActiveTab("orazaka")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "orazaka"
                ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Orazaka Engine
          </button>
          <button
            onClick={() => setActiveTab("yororis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "yororis"
                ? "bg-[#7c9082] text-white shadow-[0_0_12px_rgba(124,144,130,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Yororis Voice
          </button>
          <button
            onClick={() => setActiveTab("jarvis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "jarvis"
                ? "bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Jarvis HUD
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "architecture"
                ? "bg-[#262b32] text-white"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Mobile & Specs
          </button>
        </nav>

        {/* Metrics & GitHub */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#88929e]">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{fps} FPS</span>
          </div>
          <a
            href="https://github.com/krizaka/krizaka-motion"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#88929e] hover:text-white flex items-center gap-1 transition-colors"
          >
            GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {/* ======================================================== */}
        {/* TAB 1: ORAZAKA ENGINE FLOW */}
        {/* ======================================================== */}
        {activeTab === "orazaka" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-orange-400 uppercase">
                  THE FOUNDATION · NEXT-GEN VISUAL
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Orazaka Neural Pipeline Flow
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Flux quantique interactif reliant les 6 produits de l'écosystème Krizaka au réacteur central Orazaka.
                  Conforme à la gouvernance @krizaka/ui/motion (pause hors écran, 60 FPS, pas de boucle concurrente).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnginePlaying(!enginePlaying)}
                  className="px-3.5 py-2 rounded-xl bg-[#14171a] border border-[#262b32] text-xs font-medium hover:bg-[#1e2227] flex items-center gap-2 transition-colors"
                >
                  {enginePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-orange-400" />}
                  {enginePlaying ? "Pause Loop" : "Play Loop"}
                </button>
                <button
                  onClick={copyDropInCode}
                  className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "Copié !" : "Code pour krizaka.com"}
                </button>
              </div>
            </div>

            {/* Interactive Canvas Canvas Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[16/9] min-h-[360px] md:min-h-[440px] bg-[#0c0d0f] rounded-2xl border border-orange-500/20 p-2 shadow-[0_0_35px_rgba(249,115,22,0.06)] relative overflow-hidden group">
                <OrazakaEngineFlow
                  playing={enginePlaying}
                  interactive
                  showTelemetry={showEngineTelemetry}
                  particleDensity={engineDensity}
                  speedMultiplier={engineSpeed}
                  highlightedSource={selectedSource}
                  onSelectSource={(src) => setSelectedSource(src)}
                  className="w-full h-full rounded-xl"
                />

                {/* Subtitle badge */}
                <div className="absolute top-4 left-4 pointer-events-none bg-[#0c0d0f]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#262b32] text-[11px] font-mono text-[#88929e]">
                  Survolez les sources pour inspecter chaque flux
                </div>
              </div>

              {/* Control Panel & Source Selector */}
              <div className="bg-[#0c0d0f] rounded-2xl border border-[#262b32] p-5 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1e2227]">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-semibold">Paramètres du flux</h3>
                </div>

                {/* Particle Density */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Densité de photons</span>
                    <span className="font-mono text-orange-400">{engineDensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.4"
                    step="0.2"
                    value={engineDensity}
                    onChange={(e) => setEngineDensity(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                {/* Flow Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Vitesse d'écoulement</span>
                    <span className="font-mono text-orange-400">{engineSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={engineSpeed}
                    onChange={(e) => setEngineSpeed(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                {/* Telemetry Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Afficher télémétrie</span>
                  <button
                    onClick={() => setShowEngineTelemetry(!showEngineTelemetry)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                      showEngineTelemetry
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : "bg-[#14171a] border-[#262b32] text-[#88929e]"
                    }`}
                  >
                    {showEngineTelemetry ? "ACTIF" : "MASQUÉ"}
                  </button>
                </div>

                {/* Source Nodes Selector */}
                <div className="pt-3 border-t border-[#1e2227] space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Sources actives :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        "yomizaka",
                        "orochia",
                        "kachizaka",
                        "akinaza",
                        "yasakia",
                        "yororis",
                      ] as ProductId[]
                    ).map((id) => {
                      const brand = PRODUCT_BRANDS[id];
                      const isSelected = selectedSource === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedSource(isSelected ? null : id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono text-left flex items-center gap-2 border transition-all ${
                            isSelected
                              ? "bg-white/10 border-white text-white font-semibold shadow-sm"
                              : "bg-[#14171a] border-[#262b32] text-[#88929e] hover:border-[#3a414d]"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: brand.primary }}
                          />
                          {brand.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-transparent to-transparent border border-orange-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-orange-300">
                  Pourquoi cette animation remplace l'ancien SVG ?
                </h4>
                <p className="text-xs text-[#88929e] mt-0.5">
                  L'ancien visualiseur utilisait un tracé SVG simple avec pointillés statiques. Ce nouveau moteur génératif calcule les trajectoires de Bézier, la dynamique des photons, l'absorption d'énergie avec ondes de choc et s'adapte en temps réel à la résolution du mobile jusqu'à 4K.
                </p>
              </div>
              <button
                onClick={copyDropInCode}
                className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#1e2227] hover:bg-[#262b32] text-xs font-medium text-white flex items-center gap-2 transition-colors self-start md:self-center"
              >
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                Voir le composant Drop-In
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: YORORIS ACOUSTIC VOICE PRESENCE */}
        {/* ======================================================== */}
        {activeTab === "yororis" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#7c9082] uppercase">
                  DEV.YORORIS.COM · ACOUSTIC PRESENCE & VOICE
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Yororis Generative Voice Sphere
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Sphère 3D harmonique réactive pour l'espace d'écoute Yororis. Visualisation des formants de la voix de Léa, ondulations thérapeutiques et guide respiratoire 4-7-8.
                </p>
              </div>

              {/* Audio drone synthesizer toggle */}
              <button
                onClick={() => setYororisAudio(!yororisAudio)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  yororisAudio
                    ? "bg-[#7c9082] text-white shadow-[0_0_16px_rgba(124,144,130,0.4)]"
                    : "bg-[#14171a] border border-[#262b32] text-[#88929e] hover:text-white"
                }`}
              >
                {yororisAudio ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                {yororisAudio ? "Synthèse Acoustique Active" : "Activer Drone Sonore"}
              </button>
            </div>

            {/* Yororis Orb Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[4/3] md:aspect-[16/9] bg-[#0c0d0f] rounded-2xl border border-[#7c9082]/30 p-2 shadow-[0_0_35px_rgba(124,144,130,0.08)] relative overflow-hidden flex items-center justify-center">
                <YororisPresenceOrb
                  state={yororisState}
                  playing={yororisPlaying}
                  enableAudio={yororisAudio}
                  showRings
                  className="w-full h-full rounded-xl"
                />

                <div className="absolute top-4 left-4 bg-[#0c0d0f]/80 backdrop-blur-md px-3 py-1 rounded-md border border-[#262b32] text-[11px] font-mono text-[#b8c5b9]">
                  Fréquence fondamentale F0 : 216 Hz · Accord apaisant
                </div>
              </div>

              {/* Yororis Controls */}
              <div className="bg-[#0c0d0f] rounded-2xl border border-[#262b32] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1e2227]">
                  <h3 className="text-sm font-semibold text-[#b8c5b9]">États de présence</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Modèle clinique et vocal</p>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      { id: "idle", label: "1. Repos & Écoute Calme" },
                      { id: "speaking", label: "2. Présence Vocale (Léa parle)" },
                      { id: "breathing", label: "3. Pacer Respiratoire (4-7-8)" },
                      { id: "reflecting", label: "4. Réflexion Clinique" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setYororisState(m.id)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        yororisState === m.id
                          ? "bg-[#7c9082]/25 border-[#7c9082] text-white shadow-sm font-semibold"
                          : "bg-[#14171a] border-[#262b32] text-[#88929e] hover:border-[#3a414d]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#1e2227] space-y-3">
                  <span className="text-xs font-medium text-[#88929e] block">Pacer 4-7-8 :</span>
                  <div className="text-xs font-mono text-[#b8c5b9] bg-[#14171a] p-3 rounded-xl border border-[#262b32] space-y-1">
                    <div>• 4s : Inspiration ventrale</div>
                    <div>• 7s : Rétention détendue</div>
                    <div>• 8s : Expiration lente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: JARVIS HOLOGRAPHIC HUD (IRON MAN) */}
        {/* ======================================================== */}
        {activeTab === "jarvis" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                  MARK LXXXV · ARC REACTOR CORE
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Jarvis Holographic HUD
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Interface holographique 3D inspirée du HUD de Jarvis dans Iron Man. Réacteur Arc central, 7 anneaux concentriques indépendants, gyroscope par parallaxe de souris et alertes tactiques.
                </p>
              </div>

              {/* Overdrive toggle */}
              <button
                onClick={() => setJarvisOverdrive(!jarvisOverdrive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center gap-2 transition-all ${
                  jarvisOverdrive
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
                    : "bg-[#14171a] border border-[#262b32] text-cyan-400 hover:border-cyan-500/40"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                {jarvisOverdrive ? "OVERDRIVE ACTIF !" : "ENGAGER OVERDRIVE"}
              </button>
            </div>

            {/* Jarvis HUD Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-square max-h-[580px] mx-auto w-full bg-[#05070a] rounded-2xl border border-cyan-500/30 p-2 shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden flex items-center justify-center">
                <JarvisHUD
                  theme={jarvisTheme}
                  overdrive={jarvisOverdrive}
                  interactive3D={jarvis3D}
                  rotationSpeed={jarvisSpeed}
                  showDiagnostics
                  className="w-full h-full rounded-xl"
                />

                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                  Déplacez le curseur pour incliner le champ holographique 3D
                </div>
              </div>

              {/* HUD Controls */}
              <div className="bg-[#0c0d0f] rounded-2xl border border-[#262b32] p-5 space-y-5">
                <div className="pb-3 border-b border-[#1e2227]">
                  <h3 className="text-sm font-semibold">Diagnostics & Thèmes</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Configuration holographique</p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Spectre de couleur :</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(
                      [
                        { id: "cyan", name: "Stark Cyan (Original)" },
                        { id: "orazaka", name: "Orazaka Plasma (Orange)" },
                        { id: "yororis", name: "Yororis Sage (Apaisant)" },
                        { id: "crimson", name: "Mark VII Crimson (Alerte)" },
                        { id: "gold", name: "Golden Magpie (Kachizaka)" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setJarvisTheme(t.id);
                          setJarvisOverdrive(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-mono text-left flex items-center gap-2 border transition-all ${
                          jarvisTheme === t.id && !jarvisOverdrive
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#14171a] border-[#262b32] text-[#88929e] hover:border-[#3a414d]"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: JARVIS_THEMES[t.id].primary }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Tilt Toggle */}
                <div className="pt-3 border-t border-[#1e2227] flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Inclinaison 3D gyroscopique</span>
                  <button
                    onClick={() => setJarvis3D(!jarvis3D)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                      jarvis3D
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                        : "bg-[#14171a] border-[#262b32] text-[#88929e]"
                    }`}
                  >
                    {jarvis3D ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Rotation Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Vitesse de rotation</span>
                    <span className="font-mono text-cyan-400">{jarvisSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.2"
                    value={jarvisSpeed}
                    onChange={(e) => setJarvisSpeed(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ARCHITECTURE & REACT NATIVE INTEGRATION */}
        {/* ======================================================== */}
        {activeTab === "architecture" && (
          <div className="max-w-4xl space-y-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
                STANDARDS & PORTABILITÉ KRIZAKA
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                Architecture & Compatibilité React Native
              </h2>
              <p className="text-sm text-[#88929e] mt-1">
                Conçu pour s'intégrer harmonieusement dans les applications web (Next.js, krizaka-com, dev.yororis.com) et mobiles (orazaka-mobile, yororis-mobile, orochia-mobile).
              </p>
            </div>

            {/* Rule card */}
            <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-[#262b32] space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                Règle « Krizaka UI d'abord » respectée à 100%
              </div>
              <p className="text-xs text-[#88929e] leading-relaxed">
                Le moteur <code className="text-white">MotionController</code> ne crée pas de second système d'animation concurrent. Il s'aligne directement sur le chef d'orchestre <code className="text-white">@krizaka/ui/motion</code> :
              </p>
              <ul className="text-xs text-[#88929e] space-y-1.5 list-disc list-inside">
                <li>Écoute <code className="text-orange-300">html[data-motion="ready"]</code> et attend la fin de la phase de stabilisation (settling).</li>
                <li>Respecte <code className="text-orange-300">[data-offscreen]</code> pour couper la boucle dès que l'élément quitte le viewport.</li>
                <li>Applique <code className="text-orange-300">prefers-reduced-motion</code> en arrêtant la boucle RAF pour ne rendre qu'une frame statique nette.</li>
              </ul>
            </div>

            {/* Mobile code block */}
            <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-[#262b32] space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Smartphone className="w-4 h-4" />
                Intégration React Native (iOS & Android)
              </div>
              <p className="text-xs text-[#88929e]">
                Utilisez l'adaptateur universel <code className="text-white">generateNativeWebViewHTML</code> ou connectez la géométrie mathématique directement dans <code className="text-white">@shopify/react-native-skia</code>.
              </p>
              <pre className="p-4 rounded-xl bg-[#08090a] border border-[#1e2227] text-xs font-mono text-[#b8c5b9] overflow-x-auto">
{`import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { generateNativeWebViewHTML } from "@krizaka/motion/native";

export function MobileYororisVoice() {
  const html = generateNativeWebViewHTML("yororis", { state: "speaking" });

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
  container: { width: "100%", height: 320, borderRadius: 16, overflow: "hidden" },
  webview: { backgroundColor: "transparent" },
});`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2227] bg-[#0c0d0f] px-4 md:px-8 py-4 text-center text-xs text-[#88929e]">
        <span>Krizaka Motion · Écosystème Krizaka · Licence Apache-2.0 · </span>
        <a href="https://krizaka.com" className="text-white hover:underline">
          krizaka.com
        </a>
      </footer>
    </div>
  );
}
