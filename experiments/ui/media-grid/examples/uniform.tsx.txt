"use client";

import { MediaGrid, VideoCard } from "@krizaka/ui/media-grid";

const CDN = "https://krizaka-assets.b-cdn.net/site";
const CLIPS = [
  { id: "tea", title: "Pouring the mint tea, slow", poster: `${CDN}/products/orazaka/gallery/tea-pour.d69c3a5700.webp`, portrait: false },
  { id: "story", title: "Backstage, a minute before", poster: `${CDN}/products/orazaka/gallery/tea-pour.d69c3a5700.webp`, portrait: true },
  { id: "snow", title: "First snow on rue Saint-Denis", poster: `${CDN}/products/orazaka/gallery/mtl-snow.e3ecb20e82.webp`, portrait: false },
  { id: "watch", title: "The unlock in one tap", poster: `${CDN}/products/orazaka/gallery/desert-camp.78c6c0d26c.webp`, portrait: true },
];

// 'uniform': one frame for everyone; a clip of the other orientation is drawn whole over a blurred copy of itself.
export default function MediaGridUniform() {
  return (
    <MediaGrid
      mode="uniform"
      frame="landscape"
      items={CLIPS}
      getId={(c) => c.id}
      orientationOf={(c) => (c.portrait ? "portrait" : "landscape")}
      shelf={{ label: "Shorts", previousLabel: "Previous", nextLabel: "Next" }}
      renderItem={(c, { aspect, layout, mismatch }) => <VideoCard href={`#${c.id}`} title={c.title} aspect={aspect} layout={layout} fit={mismatch ? "contain" : "cover"} poster={c.poster} meta="2.4K views" />}
    />
  );
}
