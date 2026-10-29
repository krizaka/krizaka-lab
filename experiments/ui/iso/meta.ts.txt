import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Iso",
  summary:
    "The isometric kit: luminous objects built from the Krizaka vocabulary (hexagons, cut corners, the node) on a perspective grid — a hero driven by data (`IsoHub`) or composed from primitives.",
  status: "beta",
  category: "layout",
  domain: "foundations",
  platforms: "web",
  parity: { native: { status: "n/a", reason: "An isometric drawing of a site's hero." }, desktop: { status: "n/a", reason: "A public site's page, not a window of the Mac app." } },
  whenToUse: [
    "The hero illustration of a product or marketing page: what the product is, drawn as one object with two to four satellites.",
    "To show a flow toward or out of something (requests into a server, support toward a creator) with values written on it.",
    "An architecture teaser where a diagram would be too much: one object per layer, named on hover and focus.",
  ],
  whenNotToUse: [
    { when: "For a real architecture or data flow the reader must study: draw a schema with a text version." },
    { when: "As the background of a section: the light, the dome and the grid of a backdrop are lighter.", use: "section-backdrop" },
    { when: "More than one per screen: the hero object is unique, the rest of the page stays calm." },
  ],
  bestPractices: [
    "Start with `IsoHub`: stages, satellites and a highlight are data; the hub places satellites on both sides (never in front of the hero, never hidden behind it) and frames exactly what it draws.",
    "Name the scene (`label`) and say in `description` what it shows; name the objects (`label`) to make them explorable with the pointer and the keyboard — leave everything unnamed for a purely decorative scene.",
    "Put the scene in a brand (`.brand-<id>`): the light, the core and the flows follow the accent, in both themes.",
    "Composing by hand: paint back to front, and number the entrance with `index` so objects rise in a meaningful order.",
    "Pass words translated: labels, values on links, the highlight.",
  ],
  accessibility: {
    keyboard: [{ keys: "Tab", action: "Visits each named object of the scene: it brightens and shows its label, as under the pointer." }],
    notes: [
      "A named scene is a `group` with its `label` and its `description` (`<desc>`); an unnamed one is decorative (`aria-hidden`).",
      "Each named object is an image (`role=\"img\"`) named by its label and focusable; the drawn labels are decorative copies.",
      "Under `prefers-reduced-motion` (and with `animated={false}`) the scene is a composed still frame: objects in place, light resting along the links — not an animation cut halfway.",
      "Server-rendered static SVG, no client JavaScript; with `MotionObserver` mounted its loops pause off screen and wait for the page to settle.",
    ],
  },
  related: ["section-backdrop", "number-ticker"],
  web: {
    imports: ["IsoHub", "IsoScene", "IsoPrism", "IsoStack", "IsoDome", "IsoTile", "IsoLink", "IsoNode", "IsoLabel"],
    examples: [
      {
        name: "orazaka-hero",
        title: "Sovereign servers (Orazaka)",
        description: "Three named stages under a dome, a lit core; chats and documents flow in, answers flow out. Hover or tab to explore.",
      },
      {
        name: "creator-hero",
        title: "Support toward a creator",
        description: "The creator in the centre, tips, unlocks, auctions and challenges flowing toward them, their amounts on the links, 90 % pinned above.",
      },
      { name: "compose", title: "Composed by hand", description: "The primitives — scene, links, dome, prisms, node, tiles — painted back to front with an entrance order." },
      { name: "still", title: "Still frame", description: "`animated={false}`: the composed picture prefers-reduced-motion shows." },
    ],
  },
} satisfies ComponentMeta;
