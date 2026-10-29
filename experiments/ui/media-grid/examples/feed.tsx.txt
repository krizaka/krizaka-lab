"use client";

import { Badge } from "@krizaka/ui/badge";
import { MediaGrid, VideoCard } from "@krizaka/ui/media-grid";

const CDN = "https://krizaka-assets.b-cdn.net/site";
const WIDE = `${CDN}/products/orazaka/gallery`;
const CLIPS = [
  { id: "tea", title: "Pouring the mint tea, slow", poster: `${WIDE}/tea-pour.d69c3a5700.webp`, tall: false },
  { id: "story", title: "Backstage, a minute before", poster: `${WIDE}/tea-pour.d69c3a5700.webp`, tall: true },
  { id: "snow", title: "First snow on rue Saint-Denis", poster: `${WIDE}/mtl-snow.e3ecb20e82.webp`, tall: false },
  { id: "watch", title: "The unlock in one tap", poster: `${WIDE}/desert-camp.78c6c0d26c.webp`, tall: true },
  { id: "desert", title: "Desert camp at blue hour", poster: `${WIDE}/desert-camp.78c6c0d26c.webp`, tall: false },
  { id: "thanks", title: "Three ways to say thanks", poster: `${WIDE}/mtl-snow.e3ecb20e82.webp`, tall: true },
];

// 'split' (the feed default): vertical clips on a Shorts shelf, the others in a 16:9 grid whose cards share one height.
export default function MediaGridFeed() {
  return (
    <MediaGrid
      items={CLIPS}
      getId={(c) => c.id}
      orientationOf={(c) => (c.tall ? "portrait" : "landscape")}
      shelf={{ label: "Shorts", previousLabel: "Previous shorts", nextLabel: "Next shorts", seeAll: { href: "#shorts", label: "See all" } }}
      renderItem={(c, { aspect, layout }) => (
        <VideoCard href={`#${c.id}`} title={c.title} aspect={aspect} layout={layout} poster={c.poster} duration="0:12" meta="12.4K views" creator={{ name: "Camille" }} badges={<Badge tone="success" size="sm" className="bg-scrim">Free</Badge>} />
      )}
    />
  );
}
