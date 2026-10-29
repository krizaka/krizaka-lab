"use client";

import { LoadMore, MediaGridSkeleton } from "@krizaka/ui/media-grid";
import { useState } from "react";

// The wait, in the shape of the feed: skeleton cards of the real frames (a shelf of 9:16, a grid of 16:9) while the first
// page loads, then `LoadMore` under the list — the next page is asked a screenful before the end, the button never fails.
export default function MediaGridLoading() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <MediaGridSkeleton label="Loading videos" shelfCount={4} count={4} />
      <LoadMore
        hasMore
        loading={loading}
        onLoadMore={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1200);
        }}
        label="Load more"
        loadingLabel="Loading more videos"
      />
    </div>
  );
}
