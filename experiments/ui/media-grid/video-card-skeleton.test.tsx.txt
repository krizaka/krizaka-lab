import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { axeViolations } from "../test/axe";
import { LoadMore, MediaGridSkeleton, VideoCard, VideoCardSkeleton } from "./index";

describe("VideoCardSkeleton", () => {
  it("has the frame of the card it stands for, in both shapes and both layouts", () => {
    for (const [aspect, frame] of [["landscape", "aspect-video"], ["portrait", "aspect-[9/16]"]] as const) {
      const sk = render(<VideoCardSkeleton aspect={aspect} />).container;
      const real = render(<VideoCard href="/" title="t" aspect={aspect} />).container;
      expect(sk.querySelector(`.${CSS.escape(frame)}`)).not.toBeNull();
      expect(real.querySelector(`.${CSS.escape(frame)}`)).not.toBeNull();
    }
    expect(render(<VideoCardSkeleton layout="row" />).container.querySelector(".flex-row")).not.toBeNull();
  });

  it("is decorative", async () => {
    const { container } = render(<VideoCardSkeleton />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("MediaGridSkeleton", () => {
  it("announces the wait once and draws the shelf and the grid", async () => {
    const { container } = render(<MediaGridSkeleton label="Loading videos" count={6} shelfCount={3} />);
    expect(screen.getAllByText("Loading videos")).toHaveLength(1);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("[data-skeleton='video-card'][data-aspect='portrait']")).toHaveLength(3);
    expect(container.querySelectorAll("[data-skeleton='video-card'][data-aspect='landscape']")).toHaveLength(6);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("LoadMore", () => {
  const io: { cb: IntersectionObserverCallback; opts?: IntersectionObserverInit; live: boolean }[] = [];
  class FakeIO {
    rec: (typeof io)[number];
    constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
      this.rec = { cb, opts, live: true };
      io.push(this.rec);
    }
    observe() {}
    unobserve() {}
    disconnect() {
      this.rec.live = false;
    }
  }
  const enter = () => io.filter((o) => o.live).forEach((o) => o.cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  const props = { label: "Load more", loadingLabel: "Loading more videos", endLabel: "That is everything" };

  it("asks for the next page before the end is reached, with a screenful of margin", () => {
    io.length = 0;
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const onLoadMore = vi.fn();
    render(<LoadMore {...props} hasMore onLoadMore={onLoadMore} />);
    expect(io[0]!.opts?.rootMargin).toBe("900px 0px");
    enter();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("keeps the button as the fallback, and shows the wait and the end", () => {
    const onLoadMore = vi.fn();
    const { rerender, container } = render(<LoadMore {...props} hasMore onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<LoadMore {...props} hasMore loading onLoadMore={onLoadMore} />);
    expect(screen.getByRole("status", { name: "Loading more videos" })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<LoadMore {...props} hasMore={false} onLoadMore={onLoadMore} />);
    expect(screen.getByText("That is everything")).toBeTruthy();
    expect(container.querySelector("[data-state='end']")).not.toBeNull();
  });

  it("after a failure waits for the button, and does not retry by itself", () => {
    io.length = 0;
    vi.stubGlobal("IntersectionObserver", FakeIO);
    const onLoadMore = vi.fn();
    render(<LoadMore {...props} retryLabel="Try again" hasMore failed onLoadMore={onLoadMore} />);
    expect(io.filter((o) => o.live)).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
