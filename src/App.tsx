import React, { useState, useEffect } from "react";
import {
  OrazakaEngineFlow,
  YororisPresenceOrb,
  JarvisHUD,
  LiquidCausticsView,
  NeuralLatticeView,
} from "./react";
import {
  type ProductId,
  type YororisState,
  type JarvisTheme,
  type FlowDirection,
  type FlowMode,
  type ParticleStyle,
  type ConduitStyle,
  type IconType,
  type ProductSourceNode,
} from "./core/types";
import { PRODUCT_BRANDS, JARVIS_THEMES } from "./core/color-palettes";
import { CAUSTIC_PALETTES, type CausticPalette } from "./core/liquid-caustics";
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
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  RotateCw,
  Droplets,
  Network,
  Cpu,
  FileText,
  Video,
  BarChart2,
  Calendar,
  MessageSquare,
  Mic,
  Brain,
  Shield,
  Zap,
  X,
  Settings2,
} from "lucide-react";

type TabId = "orazaka" | "yororis" | "jarvis" | "caustics" | "lattice" | "architecture";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("orazaka");
  const [fps, setFps] = useState(60);

  // Orazaka Controls
  const [enginePlaying, setEnginePlaying] = useState(true);
  const [engineDensity, setEngineDensity] = useState(1.2);
  const [engineSpeed, setEngineSpeed] = useState(1.0);
  const [direction, setDirection] = useState<FlowDirection>("left-to-right");
  const [flowMode, setFlowMode] = useState<FlowMode>("inbound");
  const [particleStyle, setParticleStyle] = useState<ParticleStyle>("photons");
  const [conduitStyle, setConduitStyle] = useState<ConduitStyle>("smooth-bezier");
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedSource, setSelectedSource] = useState<ProductId | null>(null);
  const [inspectingNode, setInspectingNode] = useState<ProductSourceNode | null>(null);
  const [nodeConfigs, setNodeConfigs] = useState<Partial<Record<ProductId, Partial<ProductSourceNode>>>>({});
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

  // Liquid Caustics Controls
  const [causticPalette, setCausticPalette] = useState<CausticPalette>("obsidian");
  const [refractionStrength, setRefractionStrength] = useState(1.0);

  // Neural Lattice Controls
  const [latticeTheme, setLatticeTheme] = useState<"obsidian-gold" | "sage-calm" | "prussian-cyan">("obsidian-gold");
  const [nodeCount, setNodeCount] = useState(52);

  // FPS monitor
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

  const updateNodeField = <K extends keyof ProductSourceNode>(
    id: ProductId,
    field: K,
    value: ProductSourceNode[K]
  ) => {
    setNodeConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    if (inspectingNode && inspectingNode.id === id) {
      setInspectingNode({ ...inspectingNode, [field]: value });
    }
  };

  const copyDropInCode = () => {
    const code = `import { OrazakaEngineFlow } from "@krizaka/motion";

export function Engine({ playing }: { playing: boolean }) {
  return (
    <OrazakaEngineFlow
      playing={playing}
      direction="${direction}"
      flowMode="${flowMode}"
      particleStyle="${particleStyle}"
      conduitStyle="${conduitStyle}"
      showTelemetry
      particleDensity={${engineDensity}}
      className="pv-engine-nextgen"
    />
  );
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f0f2f5] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#1a1e24] bg-[#0c0d10]/90 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shadow-[0_0_14px_rgba(249,115,22,0.3)]">
            kz
          </div>
          <div>
            <h1 className="font-semibold text-sm md:text-base tracking-tight flex items-center gap-2">
              Krizaka Motion
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                v1.2.0 · Next-Level
              </span>
            </h1>
            <p className="text-xs text-[#88929e] hidden sm:block">
              Moteurs visuels génératifs, physique tactile & audio-visuelle pour l'écosystème Krizaka
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <nav className="flex items-center gap-1 bg-[#121519] p-1 rounded-xl border border-[#22272e] overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("orazaka")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "orazaka"
                ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Orazaka Engine
          </button>
          <button
            onClick={() => setActiveTab("yororis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "yororis"
                ? "bg-[#7c9082] text-white shadow-[0_0_12px_rgba(124,144,130,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Yororis Voice
          </button>
          <button
            onClick={() => setActiveTab("jarvis")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "jarvis"
                ? "bg-cyan-500 text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Jarvis HUD
          </button>
          <button
            onClick={() => setActiveTab("caustics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "caustics"
                ? "bg-amber-500 text-black font-semibold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Liquid Glass
          </button>
          <button
            onClick={() => setActiveTab("lattice")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "lattice"
                ? "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Neural Lattice
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "architecture"
                ? "bg-[#262b32] text-white"
                : "text-[#88929e] hover:text-white"
            }`}
          >
            Mobile & Specs
          </button>
        </nav>

        {/* FPS & GitHub link */}
        <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {/* ======================================================== */}
        {/* TAB 1: ORAZAKA ENGINE FLOW */}
        {/* ======================================================== */}
        {activeTab === "orazaka" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-orange-400 uppercase">
                  ORAZAKA · RECOMMANDATION KRIZAKA.COM
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Orazaka Neural Pipeline Flow
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Remplacement nouvelle génération du visualiseur Orazaka. Direction paramétrable, flux bi-directionnel, icônes vectorielles et libellés entièrement personnalisables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnginePlaying(!enginePlaying)}
                  className="px-3.5 py-2 rounded-xl bg-[#121519] border border-[#22272e] text-xs font-medium hover:bg-[#1a1e24] flex items-center gap-2 transition-colors"
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

            {/* Canvas + Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Interactive Visual Canvas */}
              <div className="lg:col-span-3 aspect-[16/9] min-h-[380px] md:min-h-[460px] bg-[#0c0d10] rounded-2xl border border-orange-500/25 p-2 shadow-[0_0_40px_rgba(249,115,22,0.06)] relative overflow-hidden flex items-center justify-center">
                <OrazakaEngineFlow
                  playing={enginePlaying}
                  direction={direction}
                  flowMode={flowMode}
                  particleStyle={particleStyle}
                  conduitStyle={conduitStyle}
                  interactive
                  showTelemetry={showTelemetry}
                  showLabels={showLabels}
                  particleDensity={engineDensity}
                  speedMultiplier={engineSpeed}
                  highlightedSource={selectedSource}
                  nodeConfigs={nodeConfigs}
                  onSelectSource={(src) => setSelectedSource(src)}
                  onNodeClick={(node) => setInspectingNode(node)}
                  className="w-full h-full rounded-xl"
                />

                <div className="absolute top-4 left-4 pointer-events-none bg-[#0c0d10]/85 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-[#88929e]">
                  Cliquez sur n'importe quel nœud pour personnaliser son icône et son libellé
                </div>
              </div>

              {/* Comprehensive Control Panel */}
              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-5 max-h-[600px] overflow-y-auto">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1a1e24]">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-semibold">Paramètres du flux</h3>
                </div>

                {/* Direction Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Direction du flux :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "left-to-right", label: "Gauche → Droite", icon: ArrowRight },
                      { id: "right-to-left", label: "Droite → Gauche", icon: ArrowLeft },
                      { id: "top-to-bottom", label: "Haut → Bas", icon: ArrowDown },
                      { id: "radial", label: "Radial / Centré", icon: RotateCw },
                    ].map((d) => {
                      const Icon = d.icon;
                      const isSel = direction === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setDirection(d.id as FlowDirection)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                            isSel
                              ? "bg-orange-500/20 border-orange-500 text-orange-300 font-semibold shadow-sm"
                              : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="truncate">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flow Mode */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Sens des requêtes (Mode) :</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "inbound", label: "Entrant" },
                      { id: "outbound", label: "Sortant" },
                      { id: "bidirectional", label: "Bi-directionnel" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setFlowMode(m.id as FlowMode)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          flowMode === m.id
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Particle Style */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Style des particules :</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "photons", label: "Photons" },
                      { id: "data-blocks", label: "Hex Data" },
                      { id: "beams", label: "Lasers" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setParticleStyle(s.id as ParticleStyle)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-mono border text-center transition-all ${
                          particleStyle === s.id
                            ? "bg-orange-500/20 border-orange-500 text-orange-300 font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conduit Style */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Style des conduits :</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "smooth-bezier", label: "Bézier S" },
                      { id: "straight", label: "Direct" },
                      { id: "cyber-grid", label: "PCB Grid" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setConduitStyle(c.id as ConduitStyle)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          conduitStyle === c.id
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2 border-t border-[#1a1e24]">
                  <div className="space-y-1">
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#88929e]">Vitesse du flux</span>
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
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-[#1a1e24]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#88929e]">Afficher les libellés</span>
                    <button
                      onClick={() => setShowLabels(!showLabels)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                        showLabels
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-[#121519] border-[#22272e] text-[#88929e]"
                      }`}
                    >
                      {showLabels ? "OUI" : "NON"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#88929e]">Télémétrie en temps réel</span>
                    <button
                      onClick={() => setShowTelemetry(!showTelemetry)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                        showTelemetry
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-[#121519] border-[#22272e] text-[#88929e]"
                      }`}
                    >
                      {showTelemetry ? "ACTIF" : "MASQUÉ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Node Inspector Drawer / Modal */}
            {inspectingNode && (
              <div className="p-5 rounded-2xl bg-[#0c0d10] border border-orange-500/40 space-y-4 shadow-[0_0_25px_rgba(249,115,22,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#1a1e24]">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-semibold">
                      Personnalisation du nœud : <span className="text-orange-400">{inspectingNode.name}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setInspectingNode(null)}
                    className="p-1 rounded-lg text-[#88929e] hover:text-white hover:bg-[#1a1e24]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Nom du produit / service :</label>
                    <input
                      type="text"
                      value={nodeConfigs[inspectingNode.id]?.name ?? inspectingNode.name}
                      onChange={(e) => updateNodeField(inspectingNode.id, "name", e.target.value)}
                      className="w-full bg-[#121519] border border-[#22272e] rounded-xl px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Subtitle Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Sous-titre / Spécialité :</label>
                    <input
                      type="text"
                      value={nodeConfigs[inspectingNode.id]?.subtitle ?? inspectingNode.subtitle}
                      onChange={(e) => updateNodeField(inspectingNode.id, "subtitle", e.target.value)}
                      className="w-full bg-[#121519] border border-[#22272e] rounded-xl px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Icône vectorielle :</label>
                    <select
                      value={nodeConfigs[inspectingNode.id]?.iconType ?? inspectingNode.iconType}
                      onChange={(e) => updateNodeField(inspectingNode.id, "iconType", e.target.value as IconType)}
                      className="w-full bg-[#121519] border border-[#22272e] rounded-xl px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="doc">Document AI</option>
                      <option value="video">Vidéo 4K / Média</option>
                      <option value="chart">Graphique / Analytics</option>
                      <option value="calendar">Calendrier / Réservation</option>
                      <option value="chat">Chat / Message</option>
                      <option value="voice">Audio / Voix</option>
                      <option value="brain">Cerveau Cognitif</option>
                      <option value="cpu">Processeur / Core</option>
                      <option value="shield">Sécurité / Guard</option>
                      <option value="zap">Énergie / Flux Flash</option>
                    </select>
                  </div>

                  {/* Color Swatch */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Couleur du flux :</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={nodeConfigs[inspectingNode.id]?.color ?? inspectingNode.color}
                        onChange={(e) => updateNodeField(inspectingNode.id, "color", e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-[#22272e]"
                      />
                      <span className="text-xs font-mono text-[#88929e]">
                        {nodeConfigs[inspectingNode.id]?.color ?? inspectingNode.color}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: YORORIS ACOUSTIC PRESENCE */}
        {/* ======================================================== */}
        {activeTab === "yororis" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#7c9082] uppercase">
                  DEV.YORORIS.COM · ESPACE VOCAL & HARMONIQUE
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Yororis Generative Voice Sphere
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Sphère 3D harmonique de présence pour Yororis. Visualisation des formants de la voix de Léa, ondes acoustiques et pacer de respiration 4-7-8.
                </p>
              </div>

              <button
                onClick={() => setYororisAudio(!yororisAudio)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  yororisAudio
                    ? "bg-[#7c9082] text-white shadow-[0_0_16px_rgba(124,144,130,0.4)]"
                    : "bg-[#121519] border border-[#22272e] text-[#88929e] hover:text-white"
                }`}
              >
                {yororisAudio ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                {yororisAudio ? "Synthèse Acoustique Active" : "Activer Drone Sonore"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[4/3] md:aspect-[16/9] bg-[#0c0d10] rounded-2xl border border-[#7c9082]/30 p-2 shadow-[0_0_35px_rgba(124,144,130,0.08)] relative overflow-hidden flex items-center justify-center">
                <YororisPresenceOrb
                  state={yororisState}
                  playing={yororisPlaying}
                  enableAudio={yororisAudio}
                  showRings
                  className="w-full h-full rounded-xl"
                />

                <div className="absolute top-4 left-4 bg-[#0c0d10]/80 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-[#b8c5b9]">
                  Fréquence fondamentale F0 : 216 Hz · Résonance de Léa
                </div>
              </div>

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold text-[#b8c5b9]">États de présence</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Modèle clinique et vocal</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "idle", label: "1. Repos & Écoute Calme" },
                    { id: "speaking", label: "2. Présence Vocale (Léa parle)" },
                    { id: "breathing", label: "3. Pacer Respiratoire (4-7-8)" },
                    { id: "reflecting", label: "4. Réflexion Clinique" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setYororisState(m.id as YororisState)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        yororisState === m.id
                          ? "bg-[#7c9082]/25 border-[#7c9082] text-white shadow-sm font-semibold"
                          : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#1a1e24] space-y-3">
                  <span className="text-xs font-medium text-[#88929e] block">Pacer 4-7-8 :</span>
                  <div className="text-xs font-mono text-[#b8c5b9] bg-[#121519] p-3 rounded-xl border border-[#22272e] space-y-1">
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
        {/* TAB 3: JARVIS HOLOGRAPHIC HUD */}
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
                  Interface holographique 3D inspirée du HUD de Jarvis dans Iron Man. Réacteur Arc central, 7 anneaux concentriques, gyroscope par parallaxe de souris et alertes tactiques.
                </p>
              </div>

              <button
                onClick={() => setJarvisOverdrive(!jarvisOverdrive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center gap-2 transition-all ${
                  jarvisOverdrive
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
                    : "bg-[#121519] border border-[#22272e] text-cyan-400 hover:border-cyan-500/40"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                {jarvisOverdrive ? "OVERDRIVE ACTIF !" : "ENGAGER OVERDRIVE"}
              </button>
            </div>

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

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-5">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Diagnostics & Thèmes</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Configuration holographique</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-[#88929e] block">Spectre de couleur :</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: "cyan", name: "Stark Cyan (Original)" },
                      { id: "orazaka", name: "Orazaka Plasma (Orange)" },
                      { id: "yororis", name: "Yororis Sage (Apaisant)" },
                      { id: "crimson", name: "Mark VII Crimson (Alerte)" },
                      { id: "gold", name: "Golden Magpie (Kachizaka)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setJarvisTheme(t.id as JarvisTheme);
                          setJarvisOverdrive(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-mono text-left flex items-center gap-2 border transition-all ${
                          jarvisTheme === t.id && !jarvisOverdrive
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: JARVIS_THEMES[t.id as JarvisTheme].primary }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1a1e24] flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Inclinaison 3D gyroscopique</span>
                  <button
                    onClick={() => setJarvis3D(!jarvis3D)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${
                      jarvis3D
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                        : "bg-[#121519] border-[#22272e] text-[#88929e]"
                    }`}
                  >
                    {jarvis3D ? "ON" : "OFF"}
                  </button>
                </div>

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
        {/* TAB 4: LIQUID GLASS CAUSTICS */}
        {/* ======================================================== */}
        {activeTab === "caustics" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  SPATIAL UX · DISPERSION CHROMATIQUE & CAUSTIQUES
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Liquid Glass Caustic Mesh
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Réfraction optique selon la loi de Snell-Descartes avec dispersion de longueur d'onde RGB. Ondulations fluides à amortissement visqueux de Navier-Stokes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[16/9] min-h-[380px] bg-[#07080a] rounded-2xl border border-amber-500/30 p-2 shadow-[0_0_40px_rgba(245,158,11,0.08)] relative overflow-hidden flex items-center justify-center">
                <LiquidCausticsView
                  palette={causticPalette}
                  interactive
                  refractionStrength={refractionStrength}
                  className="w-full h-full rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-amber-300">
                  Cliquez ou déplacez le curseur pour créer des ondes de réfraction fluide
                </div>
              </div>

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Palettes Minérales</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Teintes architecturales</p>
                </div>

                <div className="space-y-2">
                  {(["obsidian", "prussian", "yororis", "amber"] as CausticPalette[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCausticPalette(p)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                        causticPalette === p
                          ? "bg-white/10 border-white text-white font-semibold"
                          : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                      }`}
                    >
                      <span>{CAUSTIC_PALETTES[p].name}</span>
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: CAUSTIC_PALETTES[p].highlight }}
                      />
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#1a1e24] space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Indice de réfraction</span>
                    <span className="font-mono text-amber-400">{refractionStrength.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={refractionStrength}
                    onChange={(e) => setRefractionStrength(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: QUANTUM NEURAL LATTICE */}
        {/* ======================================================== */}
        {activeTab === "lattice" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
                  COGNITIVE MESH · MAILLAGE SYNAPTIQUE
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Quantum Neural Synapse Lattice
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Réseau synaptique dynamique Delaunay / K-NN avec propagation de potentiels d'action et champ d'excitation tactile au curseur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[16/9] min-h-[380px] bg-[#07080a] rounded-2xl border border-indigo-500/30 p-2 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden flex items-center justify-center">
                <NeuralLatticeView
                  nodeCount={nodeCount}
                  interactive
                  theme={latticeTheme}
                  className="w-full h-full rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-indigo-300">
                  Survolez ou cliquez pour propager des impulsions synaptiques
                </div>
              </div>

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Densité synaptique</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Topologie du maillage</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Nombre de nœuds</span>
                    <span className="font-mono text-indigo-400">{nodeCount}</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="4"
                    value={nodeCount}
                    onChange={(e) => setNodeCount(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ARCHITECTURE & SPECS */}
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

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-[#22272e] space-y-3">
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

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-[#22272e] space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Smartphone className="w-4 h-4" />
                Intégration React Native (iOS & Android)
              </div>
              <p className="text-xs text-[#88929e]">
                Utilisez l'adaptateur universel <code className="text-white">generateNativeWebViewHTML</code> ou connectez la géométrie mathématique directement dans <code className="text-white">@shopify/react-native-skia</code>.
              </p>
              <pre className="p-4 rounded-xl bg-[#07080a] border border-[#1a1e24] text-xs font-mono text-[#b8c5b9] overflow-x-auto">
{`import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { generateNativeWebViewHTML } from "@krizaka/motion/native";

export function MobileOrazakaFlow() {
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
  container: { width: "100%", height: 320, borderRadius: 16, overflow: "hidden" },
  webview: { backgroundColor: "transparent" },
});`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1e24] bg-[#0c0d10] px-4 md:px-8 py-4 text-center text-xs text-[#88929e]">
        <span>Krizaka Motion · Écosystème Krizaka · Licence Apache-2.0 · </span>
        <a href="https://krizaka.com" className="text-white hover:underline">
          krizaka.com
        </a>
      </footer>
    </div>
  );
}
