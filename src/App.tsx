import React, { useState, useEffect, useRef } from "react";
import {
  OrazakaEngineFlow,
  YororisPresenceOrb,
  type YororisPresenceOrbHandle,
  JarvisHUD,
  type JarvisHUDHandle,
  LiquidCausticsView,
  type LiquidCausticsViewHandle,
  NeuralLatticeView,
  type NeuralLatticeViewHandle,
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
import {
  CAUSTIC_PALETTES,
  type CausticPalette,
  type FluidMedium,
} from "./core/liquid-caustics";
import { type YororisVoiceTone } from "./core/yororis-synthesis";
import { type JarvisTacticalMode, type TargetLock } from "./core/jarvis-hud";

// Direct imports of @krizaka/ui components from npm
import { Button } from "@krizaka/ui/button";
import { Card } from "@krizaka/ui/card";
import { Badge } from "@krizaka/ui/badge";
import { Chip } from "@krizaka/ui/chip";

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
  MicOff,
  Brain,
  Shield,
  Zap,
  X,
  Settings2,
  Target,
  Radio,
  Eye,
  Compass,
  Waves,
  RefreshCw,
  Flame,
  ShieldCheck,
  Crosshair,
  Terminal,
  Box,
} from "lucide-react";

type TabId =
  | "orazaka"
  | "yororis"
  | "jarvis"
  | "caustics"
  | "lattice"
  | "kz-ui"
  | "architecture";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("orazaka");
  const [fps, setFps] = useState(60);

  // ==========================================
  // 1. Orazaka Engine Controls
  // ==========================================
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

  // ==========================================
  // 2. Yororis Acoustic Controls
  // ==========================================
  const orbRef = useRef<YororisPresenceOrbHandle>(null);
  const [yororisState, setYororisState] = useState<YororisState>("idle");
  const [yororisVoiceTone, setYororisVoiceTone] = useState<YororisVoiceTone>("lea");
  const [yororisPlaying, setYororisPlaying] = useState(true);
  const [yororisAudio, setYororisAudio] = useState(false);
  const [yororisMicActive, setYororisMicActive] = useState(false);
  const [yororisSpores, setYororisSpores] = useState(true);
  const [yororisAuraFace, setYororisAuraFace] = useState(true);
  const [yororisIntensity, setYororisIntensity] = useState(1.0);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathingCount, setBreathingCount] = useState(4);

  // ==========================================
  // 3. Jarvis HUD Controls
  // ==========================================
  const hudRef = useRef<JarvisHUDHandle>(null);
  const [jarvisTheme, setJarvisTheme] = useState<JarvisTheme>("cyan");
  const [jarvisTacticalMode, setJarvisTacticalMode] = useState<JarvisTacticalMode>("standard");
  const [jarvisOverdrive, setJarvisOverdrive] = useState(false);
  const [jarvis3D, setJarvis3D] = useState(true);
  const [jarvisSpeed, setJarvisSpeed] = useState(1.0);
  const [jarvisActiveLock, setJarvisActiveLock] = useState<TargetLock | null>(null);
  const [energyMatrix, setEnergyMatrix] = useState({
    repulsors: 85,
    shields: 94,
    unibeam: 60,
    thrusters: 78,
  });

  // ==========================================
  // 4. Liquid Glass Controls
  // ==========================================
  const causticsRef = useRef<LiquidCausticsViewHandle>(null);
  const [causticPalette, setCausticPalette] = useState<CausticPalette>("obsidian");
  const [fluidMedium, setFluidMedium] = useState<FluidMedium>("glass");
  const [refractionStrength, setRefractionStrength] = useState(1.0);
  const [viscosity, setViscosity] = useState(0.98);
  const [showUnderlyingText, setShowUnderlyingText] = useState(true);

  // ==========================================
  // 5. Neural Lattice Controls
  // ==========================================
  const latticeRef = useRef<NeuralLatticeViewHandle>(null);
  const [latticeTheme, setLatticeTheme] = useState<"obsidian-gold" | "sage-calm" | "prussian-cyan">("obsidian-gold");
  const [nodeCount, setNodeCount] = useState(52);
  const [enableHebbian, setEnableHebbian] = useState(true);
  const [avalancheCount, setAvalancheCount] = useState(0);

  // ==========================================
  // 6. Krizaka UI Showcase Controls
  // ==========================================
  const [kzUiGuideTab, setKzUiGuideTab] = useState<"card" | "button" | "voice" | "governance">("card");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

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

  // 4-7-8 Breathing Pacer Timer
  useEffect(() => {
    if (yororisState !== "breathing") return;
    let timer: ReturnType<typeof setTimeout>;
    let phase: "inhale" | "hold" | "exhale" = "inhale";
    let count = 4;

    const tick = () => {
      count--;
      if (count <= 0) {
        if (phase === "inhale") {
          phase = "hold";
          count = 7;
        } else if (phase === "hold") {
          phase = "exhale";
          count = 8;
        } else {
          phase = "inhale";
          count = 4;
        }
      }
      setBreathingPhase(phase);
      setBreathingCount(count);
      timer = setTimeout(tick, 1000);
    };

    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, [yororisState]);

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

  const copyKzSnippet = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Toggle live mic
  const handleToggleMic = async () => {
    if (!orbRef.current) return;
    const active = await orbRef.current.toggleMicrophone(!yororisMicActive);
    setYororisMicActive(active);
    if (active) {
      setYororisState("speaking");
    } else {
      setYororisState("idle");
    }
  };

  // Toggle procedural audio
  const handleToggleDrone = () => {
    if (!orbRef.current) return;
    const active = orbRef.current.toggleProceduralAudio(!yororisAudio);
    setYororisAudio(active);
  };

  // Trigger ripple in liquid glass
  const handleTriggerCausticRipple = () => {
    if (!causticsRef.current) return;
    causticsRef.current.addRipple(250 + (Math.random() - 0.5) * 150, 180 + (Math.random() - 0.5) * 100, 1.8);
  };

  // Trigger cascade avalanche in neural lattice
  const handleTriggerAvalanche = () => {
    if (!latticeRef.current) return;
    latticeRef.current.triggerCascadeAvalanche();
    setAvalancheCount((prev) => prev + 1);
  };

  // Acquire target lock in Jarvis HUD
  const handleAcquireRandomTarget = () => {
    if (!hudRef.current) return;
    const x = 120 + Math.random() * 360;
    const y = 120 + Math.random() * 360;
    hudRef.current.lockTarget(x, y);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f0f2f5] flex flex-col font-sans selection:bg-orange-500/30">
      {/* Top Header */}
      <header className="border-b border-[#1a1e24] bg-[#0c0d10]/95 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm shadow-[0_0_14px_rgba(249,115,22,0.3)]">
            kz
          </div>
          <div>
            <h1 className="font-semibold text-sm md:text-base tracking-tight flex items-center gap-2">
              Krizaka Motion
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                v1.3.0 · Next-Level
              </span>
            </h1>
            <p className="text-xs text-[#88929e] hidden sm:block">
              Moteurs visuels génératifs, optique Snell, physique tactile & composants @krizaka/ui
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
            onClick={() => setActiveTab("kz-ui")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "kz-ui"
                ? "bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-semibold shadow-[0_0_14px_rgba(249,115,22,0.4)]"
                : "text-orange-400/90 hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Krizaka UI + Motion
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

            {/* Node Inspector Drawer */}
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
                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Nom du produit / service :</label>
                    <input
                      type="text"
                      value={nodeConfigs[inspectingNode.id]?.name ?? inspectingNode.name}
                      onChange={(e) => updateNodeField(inspectingNode.id, "name", e.target.value)}
                      className="w-full bg-[#121519] border border-[#22272e] rounded-xl px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#88929e]">Sous-titre / Spécialité :</label>
                    <input
                      type="text"
                      value={nodeConfigs[inspectingNode.id]?.subtitle ?? inspectingNode.subtitle}
                      onChange={(e) => updateNodeField(inspectingNode.id, "subtitle", e.target.value)}
                      className="w-full bg-[#121519] border border-[#22272e] rounded-xl px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

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
        {/* TAB 2: YORORIS ACOUSTIC PRESENCE (V2 NEXT-LEVEL) */}
        {/* ======================================================== */}
        {activeTab === "yororis" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-widest text-[#7c9082] uppercase">
                    DEV.YORORIS.COM · ESPACE VOCAL & HARMONIQUE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7c9082]/20 border border-[#7c9082]/40 text-[#b8c5b9]">
                    F0 = 216 Hz · Résonance de Léa
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Yororis Generative Acoustic Voice Sphere
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Synthèse acoustique générative, rubans de formants vocaux, nuage de spores bioluminescentes, regard empathique et analyse microphone temps réel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Microphone Toggle */}
                <button
                  onClick={handleToggleMic}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                    yororisMicActive
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.3)] animate-pulse"
                      : "bg-[#121519] border-[#22272e] text-[#88929e] hover:text-white"
                  }`}
                >
                  {yororisMicActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                  {yororisMicActive ? "Microphone Ouvert (Live)" : "Activer Microphone"}
                </button>

                {/* Soothing Drone Toggle */}
                <button
                  onClick={handleToggleDrone}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    yororisAudio
                      ? "bg-[#7c9082] text-white shadow-[0_0_16px_rgba(124,144,130,0.4)]"
                      : "bg-[#121519] border border-[#22272e] text-[#88929e] hover:text-white"
                  }`}
                >
                  {yororisAudio ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                  {yororisAudio ? "Drone Thérapeutique Actif" : "Activer Drone 216Hz"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[4/3] md:aspect-[16/9] bg-[#090d0b] rounded-2xl border border-[#7c9082]/35 p-2 shadow-[0_0_45px_rgba(124,144,130,0.12)] relative overflow-hidden flex items-center justify-center">
                <YororisPresenceOrb
                  ref={orbRef}
                  state={yororisState}
                  voiceTone={yororisVoiceTone}
                  playing={yororisPlaying}
                  enableAudio={yororisAudio}
                  showSpores={yororisSpores}
                  showAuraFace={yororisAuraFace}
                  intensity={yororisIntensity}
                  showRings
                  className="w-full h-full rounded-xl"
                />

                {/* Active telemetry badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                  <div className="bg-[#0c0d10]/85 backdrop-blur-md px-3 py-1 rounded-md border border-[#7c9082]/40 text-[11px] font-mono text-[#b8c5b9] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7c9082] animate-ping" />
                    Profil : {yororisVoiceTone.toUpperCase()} · Freq: {
                      yororisVoiceTone === "lea" ? "216 Hz" :
                      yororisVoiceTone === "theta" ? "432 Hz" :
                      yororisVoiceTone === "solfeggio" ? "528 Hz" : "639 Hz"
                    }
                  </div>
                  {yororisMicActive && (
                    <div className="bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                      <Radio className="w-3 h-3 animate-spin" />
                      Analyse spectrale en temps réel (Micro actif)
                    </div>
                  )}
                </div>

                {/* Pacer Countdown Overlay during breathing mode */}
                {yororisState === "breathing" && (
                  <div className="absolute bottom-6 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-[#7c9082]/40 flex items-center gap-3 shadow-xl">
                    <Compass className="w-5 h-5 text-[#7c9082] animate-spin" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#88929e] block font-mono">
                        Pacer Clinique 4-7-8
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {breathingPhase === "inhale" && `Inspirez profondément... (${breathingCount}s)`}
                        {breathingPhase === "hold" && `Bloquez en douceur... (${breathingCount}s)`}
                        {breathingPhase === "exhale" && `Expirez lentement... (${breathingCount}s)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Yororis Controls */}
              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold text-[#b8c5b9]">Harmoniques & États</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Thérapie vocale et présence</p>
                </div>

                {/* State selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[#88929e] block">État psychologique :</span>
                  <div className="space-y-1.5">
                    {[
                      { id: "idle", label: "1. Repos & Écoute Calme" },
                      { id: "speaking", label: "2. Présence Vocale (Léa parle)" },
                      { id: "breathing", label: "3. Pacer Respiratoire (4-7-8)" },
                      { id: "reflecting", label: "4. Réflexion Clinique" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setYororisState(m.id as YororisState)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                          yororisState === m.id
                            ? "bg-[#7c9082]/25 border-[#7c9082] text-white shadow-sm font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Tone Selector */}
                <div className="space-y-1.5 pt-2 border-t border-[#1a1e24]">
                  <span className="text-xs font-medium text-[#88929e] block">Bande tonale vocale :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "lea", label: "Léa (216 Hz)" },
                      { id: "theta", label: "Thêta (432 Hz)" },
                      { id: "solfeggio", label: "Miracle (528 Hz)" },
                      { id: "aurora", label: "Aurore (639 Hz)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setYororisVoiceTone(t.id as YororisVoiceTone)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border text-center transition-all ${
                          yororisVoiceTone === t.id
                            ? "bg-[#7c9082]/30 border-[#7c9082] text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-[#1a1e24]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#88929e]">Nuage de spores bioluminescentes</span>
                    <button
                      onClick={() => setYororisSpores(!yororisSpores)}
                      className={`px-2 py-0.5 rounded text-xs font-mono border ${
                        yororisSpores ? "bg-[#7c9082]/30 border-[#7c9082] text-white" : "bg-[#121519] border-[#22272e] text-[#88929e]"
                      }`}
                    >
                      {yororisSpores ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#88929e]">Aura & Regard empathique</span>
                    <button
                      onClick={() => setYororisAuraFace(!yororisAuraFace)}
                      className={`px-2 py-0.5 rounded text-xs font-mono border ${
                        yororisAuraFace ? "bg-[#7c9082]/30 border-[#7c9082] text-white" : "bg-[#121519] border-[#22272e] text-[#88929e]"
                      }`}
                    >
                      {yororisAuraFace ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-1 pt-2 border-t border-[#1a1e24]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Intensité vibratoire</span>
                    <span className="font-mono text-[#b8c5b9]">{yororisIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.0"
                    step="0.1"
                    value={yororisIntensity}
                    onChange={(e) => setYororisIntensity(parseFloat(e.target.value))}
                    className="w-full accent-[#7c9082] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: JARVIS HOLOGRAPHIC HUD (V2 NEXT-LEVEL) */}
        {/* ======================================================== */}
        {activeTab === "jarvis" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                    MARK LXXXV · ARC REACTOR CORE V2
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                    Mode : {jarvisTacticalMode.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Jarvis Holographic HUD Interface
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Interface holographique 3D cinéma Iron Man. Verrouillage balistique interactif par clic, matrice de distribution d'énergie, modes tactiques et gyroscope de vol.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcquireRandomTarget}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-500/25 flex items-center gap-2 transition-all"
                >
                  <Target className="w-4 h-4" />
                  Acquérir Cible
                </button>
                <button
                  onClick={() => {
                    setJarvisOverdrive(!jarvisOverdrive);
                    setJarvisTacticalMode(!jarvisOverdrive ? "overdrive" : "standard");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center gap-2 transition-all ${
                    jarvisOverdrive
                      ? "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
                      : "bg-[#121519] border border-[#22272e] text-cyan-400 hover:border-cyan-500/40"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {jarvisOverdrive ? "OVERDRIVE ENGAGÉ !" : "MAX UNIBEAM OVERDRIVE"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-square max-h-[580px] mx-auto w-full bg-[#05070a] rounded-2xl border border-cyan-500/30 p-2 shadow-[0_0_40px_rgba(6,182,212,0.12)] relative overflow-hidden flex items-center justify-center">
                <JarvisHUD
                  ref={hudRef}
                  theme={jarvisTheme}
                  tacticalMode={jarvisTacticalMode}
                  overdrive={jarvisOverdrive}
                  interactive3D={jarvis3D}
                  rotationSpeed={jarvisSpeed}
                  showDiagnostics
                  showEnergyMatrix
                  onTargetLocked={(tgt) => setJarvisActiveLock(tgt)}
                  className="w-full h-full rounded-xl"
                />

                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span>Cliquez n'importe où pour verrouiller une cible balistique</span>
                </div>

                {/* Target info popover */}
                {jarvisActiveLock && (
                  <div className="absolute bottom-6 right-6 bg-[#05070a]/90 backdrop-blur-md px-4 py-3 rounded-xl border border-red-500/50 text-xs font-mono space-y-1 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-in fade-in">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-red-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        CIBLE VERROUILLÉE
                      </span>
                      <button
                        onClick={() => {
                          hudRef.current?.clearTarget();
                          setJarvisActiveLock(null);
                        }}
                        className="text-[10px] text-zinc-400 hover:text-white"
                      >
                        [LIBÉRER]
                      </button>
                    </div>
                    <div className="text-[#88929e]">
                      POS : {Math.round(jarvisActiveLock.x)}X / {Math.round(jarvisActiveLock.y)}Y · DIST : {jarvisActiveLock.distanceMeters}m
                    </div>
                    <div className="text-[10px] text-red-300">
                      MENACE : {jarvisActiveLock.threatLevel} · SOL-AIR GUIDÉ
                    </div>
                  </div>
                )}
              </div>

              {/* Jarvis Side Controls */}
              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Modes Tactiques & Shunts</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Protocoles de combat Mark LXXXV</p>
                </div>

                {/* Tactical Modes */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[#88929e] block">Posture de combat :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "standard", label: "Standard" },
                      { id: "combat", label: "Combat" },
                      { id: "stealth", label: "Furtif" },
                      { id: "overdrive", label: "Overdrive" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setJarvisTacticalMode(m.id as JarvisTacticalMode);
                          if (m.id === "overdrive") setJarvisOverdrive(true);
                          else setJarvisOverdrive(false);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-mono border text-center transition-all ${
                          jarvisTacticalMode === m.id
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Spectrum */}
                <div className="space-y-1.5 pt-2 border-t border-[#1a1e24]">
                  <span className="text-xs font-medium text-[#88929e] block">Spectre holographique :</span>
                  <div className="space-y-1">
                    {[
                      { id: "cyan", name: "Stark Cyan" },
                      { id: "orazaka", name: "Orazaka Plasma" },
                      { id: "yororis", name: "Yororis Sage" },
                      { id: "crimson", name: "Mark VII Crimson" },
                      { id: "gold", name: "Golden Magpie" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setJarvisTheme(t.id as JarvisTheme);
                          setJarvisOverdrive(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono text-left flex items-center justify-between border transition-all ${
                          jarvisTheme === t.id && !jarvisOverdrive
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                        }`}
                      >
                        <span>{t.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: JARVIS_THEMES[t.id as JarvisTheme].primary }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Matrix Shunts */}
                <div className="space-y-2 pt-2 border-t border-[#1a1e24]">
                  <span className="text-xs font-medium text-[#88929e] block">Matrice d'énergie réacteur :</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Répulseurs</span>
                      <span className="text-white">{energyMatrix.repulsors}%</span>
                    </div>
                    <div className="w-full bg-[#121519] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full" style={{ width: `${energyMatrix.repulsors}%` }} />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-emerald-400">Boucliers nanotech</span>
                      <span className="text-white">{energyMatrix.shields}%</span>
                    </div>
                    <div className="w-full bg-[#121519] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: `${energyMatrix.shields}%` }} />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-orange-400">Unibeam central</span>
                      <span className="text-white">{energyMatrix.unibeam}%</span>
                    </div>
                    <div className="w-full bg-[#121519] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-400 h-full" style={{ width: `${energyMatrix.unibeam}%` }} />
                    </div>
                  </div>
                </div>

                {/* 3D tilt toggle */}
                <div className="pt-2 border-t border-[#1a1e24] flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Gyroscope 3D par curseur</span>
                  <button
                    onClick={() => setJarvis3D(!jarvis3D)}
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      jarvis3D ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-[#121519] border-[#22272e] text-[#88929e]"
                    }`}
                  >
                    {jarvis3D ? "ACTIF" : "STATIONNAIRE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LIQUID GLASS CAUSTICS (V2 NEXT-LEVEL) */}
        {/* ======================================================== */}
        {activeTab === "caustics" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                    SPATIAL UX · DISPERSION CHROMATIQUE & MILIEUX FLUIDES
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    Milieu : {fluidMedium.toUpperCase()} (n = {
                      fluidMedium === "glass" ? "1.52" :
                      fluidMedium === "mercury" ? "1.95" :
                      fluidMedium === "water" ? "1.33" : "1.03"
                    })
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Liquid Glass Caustic Mesh & Snell Refraction
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Réfraction optique selon la loi de Snell-Descartes avec dispersion spectrale RGB. Milieux de réfraction variables (verre, eau, mercure liquide, hélium superfluide) et déformation typographique.
                </p>
              </div>

              <button
                onClick={handleTriggerCausticRipple}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(245,158,11,0.3)]"
              >
                <Waves className="w-4 h-4" />
                Générer Onde Fluide
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[16/9] min-h-[380px] bg-[#07080a] rounded-2xl border border-amber-500/30 p-2 shadow-[0_0_40px_rgba(245,158,11,0.08)] relative overflow-hidden flex items-center justify-center">
                <LiquidCausticsView
                  ref={causticsRef}
                  palette={causticPalette}
                  fluidMedium={fluidMedium}
                  interactive
                  viscosity={viscosity}
                  refractionStrength={refractionStrength}
                  showUnderlyingText={showUnderlyingText}
                  className="w-full h-full rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-amber-300">
                  Survolez ou cliquez pour propager des ondes de réfraction optique Navier-Stokes
                </div>
              </div>

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Milieu & Dispersion</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Propriétés optiques du matériau</p>
                </div>

                {/* Medium Picker */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[#88929e] block">Milieu de réfraction :</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "glass", label: "Verre (1.52)" },
                      { id: "mercury", label: "Mercure (1.95)" },
                      { id: "water", label: "Eau (1.33)" },
                      { id: "helium", label: "Hélium (1.03)" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setFluidMedium(m.id as FluidMedium)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-mono border text-center transition-all ${
                          fluidMedium === m.id
                            ? "bg-amber-500/20 border-amber-400 text-amber-200 font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palettes */}
                <div className="space-y-1.5 pt-2 border-t border-[#1a1e24]">
                  <span className="text-xs font-medium text-[#88929e] block">Palette minérale :</span>
                  <div className="space-y-1">
                    {(["obsidian", "prussian", "yororis", "amber"] as CausticPalette[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCausticPalette(p)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all ${
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
                </div>

                {/* Sliders */}
                <div className="space-y-2 pt-2 border-t border-[#1a1e24]">
                  <div className="space-y-1">
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#88929e]">Viscosité fluide</span>
                      <span className="font-mono text-amber-400">{viscosity.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.88"
                      max="0.99"
                      step="0.01"
                      value={viscosity}
                      onChange={(e) => setViscosity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Underlying text toggle */}
                <div className="pt-2 border-t border-[#1a1e24] flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Déformation typographie</span>
                  <button
                    onClick={() => setShowUnderlyingText(!showUnderlyingText)}
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      showUnderlyingText ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-[#121519] border-[#22272e] text-[#88929e]"
                    }`}
                  >
                    {showUnderlyingText ? "ACTIF" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: QUANTUM NEURAL LATTICE (V2 NEXT-LEVEL) */}
        {/* ======================================================== */}
        {activeTab === "lattice" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
                    COGNITIVE MESH · HODGKIN-HUXLEY SYNAPTIQUE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                    Avalanches provoquées : {avalancheCount}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  Quantum Neural Synapse Lattice
                </h2>
                <p className="text-sm text-[#88929e] mt-1 max-w-2xl">
                  Réseau synaptique biologique selon le modèle de potentiel de membrane de Hodgkin-Huxley. Plasticité hebbienne (« les neurones qui s'activent ensemble se lient ensemble ») et grappes cognitives Krizaka.
                </p>
              </div>

              <button
                onClick={handleTriggerAvalanche}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                Déclencher Avalanche Neuro-synaptique
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 aspect-[16/9] min-h-[380px] bg-[#07080a] rounded-2xl border border-indigo-500/30 p-2 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden flex items-center justify-center">
                <NeuralLatticeView
                  ref={latticeRef}
                  nodeCount={nodeCount}
                  enableHebbianPlasticity={enableHebbian}
                  interactive
                  theme={latticeTheme}
                  className="w-full h-full rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-[#22272e] text-[11px] font-mono text-indigo-300">
                  Survolez ou cliquez pour stimuler la dépolarisation des synapses
                </div>

                {/* Cognitive clusters indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22272e] text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-orange-400">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> Orazaka Core
                  </span>
                  <span className="flex items-center gap-1.5 text-[#7c9082]">
                    <span className="w-2 h-2 rounded-full bg-[#7c9082]" /> Yororis Empathy
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> Jarvis Hologram
                  </span>
                </div>
              </div>

              <div className="bg-[#0c0d10] rounded-2xl border border-[#22272e] p-5 space-y-4">
                <div className="pb-3 border-b border-[#1a1e24]">
                  <h3 className="text-sm font-semibold">Plasticité & Topologie</h3>
                  <p className="text-xs text-[#88929e] mt-0.5">Paramètres neuro-computationnels</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#88929e]">Nombre de neurones</span>
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

                <div className="space-y-1.5 pt-2 border-t border-[#1a1e24]">
                  <span className="text-xs font-medium text-[#88929e] block">Thème spectral :</span>
                  <div className="space-y-1">
                    {[
                      { id: "obsidian-gold", name: "Obsidian Gold (Kachizaka)" },
                      { id: "sage-calm", name: "Sage Calm (Yororis)" },
                      { id: "prussian-cyan", name: "Prussian Cyan (Jarvis)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setLatticeTheme(t.id as any)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left border transition-all ${
                          latticeTheme === t.id
                            ? "bg-white/10 border-white text-white font-semibold"
                            : "bg-[#121519] border-[#22272e] text-[#88929e] hover:border-[#333a44]"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a1e24] flex items-center justify-between">
                  <span className="text-xs text-[#88929e]">Plasticité Hebbienne</span>
                  <button
                    onClick={() => setEnableHebbian(!enableHebbian)}
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      enableHebbian ? "bg-indigo-500/20 border-indigo-400 text-indigo-300" : "bg-[#121519] border-[#22272e] text-[#88929e]"
                    }`}
                  >
                    {enableHebbian ? "ACTIVE" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: KRIZAKA UI + MOTION LIVE SHOWCASE & INTEGRATION */}
        {/* ======================================================== */}
        {activeTab === "kz-ui" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-orange-400 uppercase">
                  ÉCOSYSTÈME KRIZAKA · NPM @KRIZAKA/UI + @KRIZAKA/MOTION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  100% npm · Zéro copie locale
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                Krizaka UI Components Augmented with Motion
              </h2>
              <p className="text-sm text-[#88929e] mt-1 max-w-3xl">
                Démonstrateur en direct montrant comment appliquer la physique et les canevas génératifs de <code className="text-orange-300">krizaka-motion</code> sur les composants officiels <code className="text-white">@krizaka/ui</code> (Card, Button, Badge, Chip) sans jamais dupliquer de code.
              </p>
            </div>

            {/* Live Interactive Grid of Augmented Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Liquid Glass Caustics Card */}
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0c0d10] p-6 shadow-[0_0_30px_rgba(245,158,11,0.06)] group">
                {/* Background Caustics Canvas */}
                <div className="absolute inset-0 opacity-40 pointer-events-auto">
                  <LiquidCausticsView
                    palette="amber"
                    fluidMedium="glass"
                    viscosity={0.98}
                    refractionStrength={1.2}
                    showUnderlyingText={false}
                    className="w-full h-full"
                  />
                </div>

                {/* Glassmorphism Foreground Card Content using @krizaka/ui */}
                <div className="relative z-10 space-y-4 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between">
                    <Badge tone="accent" size="sm">
                      Liquid Glass
                    </Badge>
                    <span className="text-[10px] font-mono text-amber-300">Card.Root</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Backdrop Snell Refractif
                    </h3>
                    <p className="text-xs text-[#b8c5b9] mt-1 leading-relaxed">
                      La carte @krizaka/ui laisse transparaître la réfraction fluide au survol de la souris.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="primary" shape="cut" size="sm">
                      Action Principale
                    </Button>
                    <Button variant="secondary" shape="rounded" size="sm">
                      Détails
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card 2: Jarvis Tactical Combat Reticle */}
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#07090d] p-6 shadow-[0_0_30px_rgba(6,182,212,0.08)] group">
                <div className="absolute inset-0 opacity-35 pointer-events-auto">
                  <JarvisHUD
                    theme="cyan"
                    tacticalMode="combat"
                    interactive3D={false}
                    rotationSpeed={0.8}
                    showDiagnostics={false}
                    showEnergyMatrix={false}
                    className="w-full h-full"
                  />
                </div>

                <div className="relative z-10 space-y-4 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between">
                    <Badge tone="warning" size="sm">
                      Mark LXXXV
                    </Badge>
                    <span className="text-[10px] font-mono text-cyan-300">Button shape="cut"</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Tactical Reticle Buttons
                    </h3>
                    <p className="text-xs text-[#b8c5b9] mt-1 leading-relaxed">
                      Boutons chamfreinés Krizaka avec télémétrie de visée et impulsion tactile.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="primary" shape="cut" size="md" className="w-full justify-between">
                      <span>VERROUILLER CIBLE</span>
                      <Crosshair className="w-4 h-4 text-cyan-200" />
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" shape="rounded" size="sm" className="flex-1">
                        STANDBY
                      </Button>
                      <Button variant="danger" shape="cut" size="sm">
                        ÉJECTER
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Yororis Acoustic Harmonic Presence */}
              <div className="relative rounded-2xl overflow-hidden border border-[#7c9082]/40 bg-[#090d0b] p-6 shadow-[0_0_30px_rgba(124,144,130,0.08)] group">
                <div className="absolute inset-0 opacity-40 pointer-events-auto">
                  <YororisPresenceOrb
                    state="speaking"
                    voiceTone="lea"
                    showSpores={true}
                    showAuraFace={false}
                    showRings={true}
                    className="w-full h-full"
                  />
                </div>

                <div className="relative z-10 space-y-4 backdrop-blur-[2px]">
                  <div className="flex items-center justify-between">
                    <Badge tone="success" size="sm">
                      Harmonique 216Hz
                    </Badge>
                    <span className="text-[10px] font-mono text-[#b8c5b9]">Chip + Badge</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Acoustic Breathing Chips
                    </h3>
                    <p className="text-xs text-[#b8c5b9] mt-1 leading-relaxed">
                      Composants Chip reflétant les états de résonance de Léa avec micro-pulsations.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Chip size="sm" className="bg-[#7c9082]/30 border-[#7c9082] text-white">
                      F0: 216 Hz
                    </Chip>
                    <Chip size="sm" className="bg-[#121519] border-[#22272e] text-[#b8c5b9]">
                      Pacer 4-7-8
                    </Chip>
                    <Chip size="sm" className="bg-[#121519] border-[#22272e] text-[#b8c5b9]">
                      Formants F1-F4
                    </Chip>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Step-by-step Integration Guide */}
            <div className="rounded-2xl border border-[#22272e] bg-[#0c0d10] p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a1e24]">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-orange-400" />
                    Comment utiliser @krizaka/motion avec @krizaka/ui
                  </h3>
                  <p className="text-xs text-[#88929e] mt-0.5">
                    Guide d'architecture complet pour Next.js, Vite et applications React
                  </p>
                </div>

                {/* Subtabs for recipes */}
                <div className="flex items-center gap-1 bg-[#121519] p-1 rounded-xl border border-[#22272e]">
                  {[
                    { id: "card", label: "1. Backdrop Card" },
                    { id: "button", label: "2. Button Springs" },
                    { id: "voice", label: "3. Voice Bubble" },
                    { id: "governance", label: "4. Règle Gouvernance" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setKzUiGuideTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        kzUiGuideTab === tab.id
                          ? "bg-orange-500/20 border border-orange-500 text-orange-300 font-semibold"
                          : "text-[#88929e] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippets for each recipe */}
              {kzUiGuideTab === "card" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#88929e]">
                      Installer depuis npm, puis positionner le canvas en <code className="text-white">absolute inset-0</code> derrière les composants <code className="text-white">Card.Root</code> :
                    </p>
                    <button
                      onClick={() =>
                        copyKzSnippet(`// 1. Installation depuis npm :
// pnpm add @krizaka/ui @krizaka/tokens @krizaka/motion

import React from "react";
import { Card } from "@krizaka/ui/card";
import { Button } from "@krizaka/ui/button";
import { Badge } from "@krizaka/ui/badge";
import { LiquidCausticsView } from "@krizaka/motion";

export function MotionGlassCard() {
  return (
    <Card.Root className="relative overflow-hidden border border-amber-500/30 rounded-2xl bg-[#0c0d10]/90">
      {/* Canevas réactif krizaka-motion en arrière-plan */}
      <div className="absolute inset-0 pointer-events-auto opacity-50">
        <LiquidCausticsView palette="amber" fluidMedium="glass" />
      </div>

      {/* Contenu Krizaka UI en premier plan */}
      <Card.Body className="relative z-10 p-6 space-y-4 backdrop-blur-[2px]">
        <Badge tone="accent">Liquid Glass</Badge>
        <Card.Title className="text-xl font-bold text-white">
          Interface Spatiale Réfractive
        </Card.Title>
        <Card.Description className="text-sm text-zinc-400">
          Ce composant Card de @krizaka/ui réagit au curseur avec réfraction de Snell.
        </Card.Description>
        <Card.Footer className="pt-2">
          <Button variant="primary" shape="cut">
            Confirmer
          </Button>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
}`)
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#121519] border border-[#22272e] text-xs font-mono text-orange-300 hover:bg-[#1a1e24] flex items-center gap-1.5"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSnippet ? "Copié !" : "Copier l'exemple"}
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-[#07080a] border border-[#1a1e24] text-xs font-mono text-[#b8c5b9] overflow-x-auto leading-relaxed">
{`// 1. Installation depuis npm :
// pnpm add @krizaka/ui @krizaka/tokens @krizaka/motion

import React from "react";
import { Card } from "@krizaka/ui/card";
import { Button } from "@krizaka/ui/button";
import { Badge } from "@krizaka/ui/badge";
import { LiquidCausticsView } from "@krizaka/motion";

export function MotionGlassCard() {
  return (
    <Card.Root className="relative overflow-hidden border border-amber-500/30 rounded-2xl bg-[#0c0d10]/90">
      {/* Canevas réactif krizaka-motion en arrière-plan */}
      <div className="absolute inset-0 pointer-events-auto opacity-50">
        <LiquidCausticsView palette="amber" fluidMedium="glass" />
      </div>

      {/* Contenu Krizaka UI en premier plan */}
      <Card.Body className="relative z-10 p-6 space-y-4 backdrop-blur-[2px]">
        <Badge tone="accent">Liquid Glass</Badge>
        <Card.Title className="text-xl font-bold text-white">
          Interface Spatiale Réfractive
        </Card.Title>
        <Card.Description className="text-sm text-zinc-400">
          Ce composant Card de @krizaka/ui réagit au curseur avec réfraction de Snell.
        </Card.Description>
        <Card.Footer className="pt-2">
          <Button variant="primary" shape="cut">
            Confirmer
          </Button>
        </Card.Footer>
      </Card.Body>
    </Card.Root>
  );
}`}
                  </pre>
                </div>
              )}

              {kzUiGuideTab === "button" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#88929e]">
                    Appliquer le solveur de ressorts différentiels <code className="text-white">SpringSolver</code> sur les boutons chamfreinés de <code className="text-white">@krizaka/ui/button</code> :
                  </p>
                  <pre className="p-4 rounded-xl bg-[#07080a] border border-[#1a1e24] text-xs font-mono text-[#b8c5b9] overflow-x-auto leading-relaxed">
{`import React, { useRef, useState } from "react";
import { Button } from "@krizaka/ui/button";
import { SpringSolver } from "@krizaka/motion/core";

export function KineticSpringButton() {
  const [offsetY, setOffsetY] = useState(0);
  const spring = useRef(new SpringSolver({ stiffness: 280, damping: 22, mass: 1 }));

  const handlePointerDown = () => {
    spring.current.setTarget(4); // Déplacement vers le bas
  };

  const handlePointerUp = () => {
    spring.current.setTarget(0); // Retour élastique net
  };

  return (
    <Button
      variant="primary"
      shape="cut"
      size="lg"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ transform: \`translateY(\${offsetY}px)\` }}
    >
      Bouton Kinetic Spring
    </Button>
  );
}`}
                  </pre>
                </div>
              )}

              {kzUiGuideTab === "voice" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#88929e]">
                    Intégrer la sphère de présence vocale dans les bulles de dialogue de l'application Yororis :
                  </p>
                  <pre className="p-4 rounded-xl bg-[#07080a] border border-[#1a1e24] text-xs font-mono text-[#b8c5b9] overflow-x-auto leading-relaxed">
{`import React from "react";
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
          <span className="text-sm font-semibold text-white">Léa · Présence Vocale</span>
          <Chip size="sm">216 Hz F0</Chip>
        </div>
        <p className="text-xs text-[#b8c5b9] mt-0.5">
          « Prenez une lente inspiration ventrale... »
        </p>
      </div>
    </div>
  );
}`}
                  </pre>
                </div>
              )}

              {kzUiGuideTab === "governance" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#07080a] border border-orange-500/30 text-xs text-[#88929e] space-y-2">
                    <div className="text-orange-400 font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Gouvernance « Krizaka UI d'abord » :
                    </div>
                    <p>
                      1. <strong className="text-white">Zéro boucle RAF concurrente :</strong> tous les moteurs de <code className="text-orange-300">krizaka-motion</code> vérifient <code className="text-white">html[data-motion="ready"]</code> et se coupent automatiquement dès que le conteneur sort du viewport via <code className="text-white">[data-offscreen]</code>.
                    </p>
                    <p>
                      2. <strong className="text-white">Accessibilité & Motion réduit :</strong> Si l'utilisateur active <code className="text-white">prefers-reduced-motion: reduce</code>, la boucle s'arrête instantanément pour ne restituer qu'un rendu vectoriel statique net (zéro vertige, zéro CLS).
                    </p>
                    <p>
                      3. <strong className="text-white">Couleurs & Tokens purs :</strong> Tous les dégradés et palettes sont mappés sur les tokens de marque <code className="text-white">@krizaka/tokens</code> (Orazaka, Yororis, Orochia, Yasakia, Kachizaka, Akinaza).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: ARCHITECTURE & SPECS */}
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
