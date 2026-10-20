/**
 * RESTful Route Definitions and Path Resolution for @krizaka/motion Demo
 */

export type TabId =
  | "orazaka"
  | "yororis"
  | "jarvis"
  | "caustics"
  | "lattice"
  | "maps"
  | "conversation"
  | "journey"
  | "figures"
  | "overlays"
  | "transitions"
  | "data"
  | "kz-ui"
  | "architecture";

export interface TabRouteDefinition {
  id: TabId;
  path: string;
  label: string;
  title: string;
  description: string;
  aliases: string[];
}

export const TAB_ROUTES: Record<TabId, TabRouteDefinition> = {
  orazaka: {
    id: "orazaka",
    path: "orazaka",
    label: "Orazaka Engine",
    title: "Orazaka Neural Flow — Krizaka Motion",
    description: "Multi-direction packet convergence & foundational neural pipeline",
    aliases: ["orazaka", "flow", "engine", "neural-flow"],
  },
  yororis: {
    id: "yororis",
    path: "yororis",
    label: "Yororis Voice",
    title: "Yororis Acoustic Presence — Krizaka Motion",
    description: "3D acoustic sphere, real-time microphone FFT & harmonic voice frequencies",
    aliases: ["yororis", "voice", "audio", "orb", "presence"],
  },
  jarvis: {
    id: "jarvis",
    path: "jarvis",
    label: "Jarvis HUD",
    title: "Jarvis Holographic HUD (Mark LXXXV) — Krizaka Motion",
    description: "Tactical target tracking, 3D gyro perspective & energy matrix",
    aliases: ["jarvis", "hud", "tactical", "iron-man"],
  },
  caustics: {
    id: "caustics",
    path: "liquid-glass",
    label: "Liquid Glass",
    title: "Liquid Glass Snell Caustics — Krizaka Motion",
    description: "Snell's law physical refraction & chromatic dispersion",
    aliases: ["liquid-glass", "caustics", "glass", "snell"],
  },
  lattice: {
    id: "lattice",
    path: "neural-lattice",
    label: "Neural Lattice",
    title: "Quantum Neural Synapse Lattice — Krizaka Motion",
    description: "Hodgkin-Huxley membrane action potentials & synaptic plasticity",
    aliases: ["neural-lattice", "lattice", "synapse", "quantum"],
  },
  maps: {
    id: "maps",
    path: "maps",
    label: "Maps",
    title: "Maps in motion — Krizaka Motion",
    description: "Pins that drop, a route that draws itself, a courier, a heat pulse — on the Krizaka UI map",
    aliases: ["maps", "map", "route", "delivery"],
  },
  conversation: {
    id: "conversation",
    path: "conversation",
    label: "Conversation",
    title: "Streaming messages and terminal replay — Krizaka Motion",
    description: "A model's answer streaming into a bubble, a terminal session played back",
    aliases: ["conversation", "chat", "stream", "terminal"],
  },
  journey: {
    id: "journey",
    path: "journey",
    label: "Journey",
    title: "A job as a journey — Krizaka Motion",
    description: "Steps that complete, a step in progress, a step that fails",
    aliases: ["journey", "stepper", "steps", "job"],
  },
  figures: {
    id: "figures",
    path: "figures",
    label: "Figures",
    title: "Figures that climb — Krizaka Motion",
    description: "NumberTicker, Meter and GoalGauge driven by one live total",
    aliases: ["figures", "ticker", "meter", "gauge"],
  },
  overlays: {
    id: "overlays",
    path: "overlays",
    label: "Overlays",
    title: "Dialog, sheet and indicator — Krizaka Motion",
    description: "A dialog in four placements, the sliding indicator of NavBar and Tabs",
    aliases: ["overlays","dialog","sheet","navbar","indicator"],
  },
  transitions: {
    id: "transitions",
    path: "transitions",
    label: "Transitions",
    title: "Page transitions — Krizaka Motion",
    description: "View changes that cross inside a stage, through the View Transitions API",
    aliases: ["transitions","page-transitions","view-transitions"],
  },
  data: {
    id: "data",
    path: "data-motion",
    label: "Data",
    title: "Data in motion — Krizaka Motion",
    description: "Table rows that arrive and sort, sparklines that grow, figures that climb",
    aliases: ["data-motion", "data", "table", "sparkline"],
  },
  "kz-ui": {
    id: "kz-ui",
    path: "krizaka-ui",
    label: "Krizaka UI + Motion",
    title: "Krizaka UI + Motion Integration — Krizaka Motion",
    description: "Direct augmentation of official npm @krizaka/ui components",
    aliases: ["krizaka-ui", "kz-ui", "components", "ui"],
  },
  architecture: {
    id: "architecture",
    path: "specs",
    label: "Mobile & Specs",
    title: "Mobile Architecture & Technical Specs — Krizaka Motion",
    description: "Zero-bloat React Native Skia adapters & mathematical specifications",
    aliases: ["specs", "architecture", "mobile", "docs"],
  },
};

export const TAB_ORDER: TabId[] = [
  "orazaka",
  "yororis",
  "jarvis",
  "caustics",
  "lattice",
  "maps",
  "conversation",
  "journey",
  "figures",
  "overlays",
  "transitions",
  "data",
  "kz-ui",
  "architecture",
];

export function resolveTabFromLocation(loc: {
  pathname?: string;
  search?: string;
  hash?: string;
}): TabId {
  // 1. Check query parameter: ?tab=yororis
  if (loc.search) {
    const rawSearch = loc.search.replace(/^\?/, "");
    const params = new URLSearchParams(rawSearch);
    const queryTab = params.get("tab")?.toLowerCase().trim();
    if (queryTab) {
      for (const [id, def] of Object.entries(TAB_ROUTES)) {
        if (id === queryTab || def.path === queryTab || def.aliases.includes(queryTab)) {
          return id as TabId;
        }
      }
    }

    // 1b. Check GitHub Pages 404 SPA format: ?/yororis or ?/krizaka-motion/yororis
    const firstKey = Array.from(params.keys())[0];
    if (firstKey && firstKey.startsWith("/")) {
      const parts = firstKey.split("/").filter(Boolean);
      const candidate = parts[parts.length - 1]?.toLowerCase();
      if (candidate) {
        for (const [id, def] of Object.entries(TAB_ROUTES)) {
          if (id === candidate || def.path === candidate || def.aliases.includes(candidate)) {
            return id as TabId;
          }
        }
      }
    }
  }

  // 2. Check hash: #/yororis or #yororis
  if (loc.hash) {
    const rawHash = loc.hash.replace(/^#[/]?/, "").trim().toLowerCase();
    if (rawHash) {
      const hashSegments = rawHash.split("/").filter(Boolean);
      const candidate = hashSegments[hashSegments.length - 1];
      for (const [id, def] of Object.entries(TAB_ROUTES)) {
        if (id === candidate || def.path === candidate || def.aliases.includes(candidate)) {
          return id as TabId;
        }
      }
    }
  }

  // 3. Check pathname: /krizaka-motion/yororis or /yororis
  if (loc.pathname) {
    const segments = loc.pathname.split("/").filter(Boolean);
    const candidate = segments[segments.length - 1]?.toLowerCase();
    if (candidate) {
      for (const [id, def] of Object.entries(TAB_ROUTES)) {
        if (id === candidate || def.path === candidate || def.aliases.includes(candidate)) {
          return id as TabId;
        }
      }
    }
  }

  return "orazaka";
}

export function getHrefForTab(tab: TabId, currentPathname: string = ""): string {
  const isKrizakaMotionBase = currentPathname.includes("/krizaka-motion");
  const prefix = isKrizakaMotionBase ? "/krizaka-motion/" : "/";
  return `${prefix}${TAB_ROUTES[tab].path}`;
}

/**
 * GitHub Pages serves `404.html` for a deep link it has no folder for, and that page sends the visitor to
 * `<base>/?/<route>` (scripts/generate-routes.mjs). The address to show instead — the REST path — or `null` when the
 * location is a normal one. `main.tsx` applies it with `history.replaceState` before the first render.
 */
export function cleanSpaRedirect(loc: { pathname: string; search: string; hash?: string }): string | null {
  if (!loc.search.startsWith("?/")) return null;
  const [route = "", ...rest] = loc.search.slice(2).split("&");
  const base = loc.pathname.endsWith("/") ? loc.pathname : `${loc.pathname}/`;
  const query = rest.length ? `?${rest.join("&")}` : "";
  return `${base}${route.replace(/~and~/g, "&")}${query}${loc.hash ?? ""}`;
}

/** A page of the lab: its home (the demos as cards) or a demo. */
export type LabPage = TabId | "home";

/** The page at a location: the demo its query, hash or last path segment names, else the home. */
export function resolvePage(loc: { pathname?: string; search?: string; hash?: string }): LabPage {
  const segments = (loc.pathname ?? "").split("/").filter(Boolean).filter((s) => s !== "krizaka-motion" && s !== "index.html");
  const named = Boolean(segments.length) || /[?&]tab=/.test(loc.search ?? "") || (loc.search ?? "").startsWith("?/") || Boolean((loc.hash ?? "").replace(/^#\/?/, ""));
  if (!named) return "home";
  const tab = resolveTabFromLocation(loc);
  // resolveTabFromLocation falls back to "orazaka": only trust it when something really named it.
  if (tab !== "orazaka") return tab;
  const words = [...segments, (loc.search ?? "").replace(/^\?(tab=|\/)?/, ""), (loc.hash ?? "").replace(/^#\/?/, "")].map((w) => w.toLowerCase());
  return words.some((w) => TAB_ROUTES.orazaka.aliases.includes(w) || w === "orazaka") ? "orazaka" : "home";
}

/** The lab's home under the current base (`/krizaka-motion/` on GitHub Pages, `/` locally). */
export function homeHref(currentPathname = ""): string {
  return currentPathname.includes("/krizaka-motion") ? "/krizaka-motion/" : "/";
}
