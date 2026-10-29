import type { ComponentMeta } from "../meta";

export const meta = {
  title: "Media grid",
  summary: "A feed of videos in mixed orientations that never staggers, with its loading states (`MediaGridSkeleton`, `VideoCardSkeleton`, `LoadMore`): `MediaGrid` routes the 9:16 clips to a `ShortsShelf` (equal-height cards, snap scroll, arrows, “See all”) and lays the others in a uniform 16:9 grid; `VideoCard` is aspect-aware and gives every card the same body height so rows align.",
  status: "beta",
  category: "media",
  domain: "media",
  platforms: "web",
  parity: { native: { status: "gap", issue: "krizaka/krizaka-ui#228", reason: "A mobile app hand-rolls its tiles and stories rail." }, desktop: "web" },
  whenToUse: [
    "A home, an explore page or a profile's Videos tab where creators publish both vertical and horizontal video.",
    "A gallery whose items come from different sources (`uniform`: everything in one frame, the odd one drawn whole over a blurred copy).",
  ],
  whenNotToUse: [
    { when: "For a feed that plays one video per screen.", use: "vertical-video" },
    { when: "For still photos the owner reorders.", use: "photo-grid" },
  ],
  bestPractices: [
    "Leave `mode` on `split` for a feed: a 9:16 card in a 16:9 grid is what makes a row tower over its neighbours.",
    "Give `orientationOf` the source's width and height, not the card's: a clip of the other shape is drawn with `fit=\"contain\"`, never cropped to a face.",
    "Put what is the product's own in the slots (`badges`, `action`); badges sit on `scrim` and read in both themes.",
    "Pass every word translated: the shelf's name, its arrows and “See all”.",
    "Give `previewSrc` the small animated WebP, never the stream: it is requested only after the pointer rests (`previewDelay`, 200 ms), fades in over the poster and is removed on leave. On a phone only the card most inside the viewport plays it, and none under Save-Data or reduced motion.",
    "Put `loading=\"eager\"` and `posterPriority=\"high\"` on the first row's posters, sized images from the CDN on the others (they are lazy).",
    "While the first page loads, draw `MediaGridSkeleton` (the same shelf and grid, the same card heights); under a long list use `LoadMore`: the next page is asked a screenful before the end, and the button stays for keyboards and failures.",
  ],
  accessibility: {
    keyboard: [
      { keys: "Tab", action: "Each card is one link (its title); the creator and the action are their own stops; the shelf takes the focus to scroll with the arrow keys." },
      { keys: "Arrow Left / Arrow Right", action: "Scrolls the focused shelf." },
    ],
    notes: [
      "The shelf is a labelled section whose row is a list; the arrows are named buttons shown with a mouse, hidden on touch (swipe).",
      "The card's whole surface is the title's link (a stretched link over the picture and the text): no nested interactive element. The badges and the duration let the click through; the creator and the action stay their own stops above it.",
      "The animated preview plays on hover or focus (after a short rest), or for the one most visible card of a phone; never under Save-Data, and on a phone never under reduced motion. It is decorative (empty `alt`).",
      "`MediaGridSkeleton` is one polite `role=\"status\"` announcement; its cards are hidden from assistive technology. `LoadMore` names its wait through the `Spinner`.",
    ],
  },
  related: ["vertical-video", "card", "photo-grid"],
  web: {
    imports: ["MediaGrid", "ShortsShelf", "VideoCard", "VideoCardSkeleton", "MediaGridSkeleton", "LoadMore"],
    examples: [
      { name: "feed", title: "A feed", description: "Three horizontal clips in the grid, three vertical on the shelf: every card of a row has one height." },
      { name: "loading", title: "Loading", description: "The skeleton of the feed in the real frames (a shelf of 9:16, a grid of 16:9) and `LoadMore` under the list." },
      { name: "uniform", title: "One frame", description: "`mode=\"uniform\"`: vertical clips drawn whole over a blurred copy inside 16:9 cards." },
    ],
  },
} satisfies ComponentMeta;
