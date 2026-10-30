import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VideoCard } from "./index";
import { resetPreviewFocus } from "./preview-focus";

function media(matches: Record<string, boolean>) {
  window.matchMedia = ((q: string) => ({ matches: matches[q] ?? false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
}

/** A controllable IntersectionObserver. */
const observers: { cb: IntersectionObserverCallback; seen: Element[] }[] = [];
class FakeIO {
  seen: Element[] = [];
  constructor(public cb: IntersectionObserverCallback) {
    observers.push(this);
  }
  observe(el: Element) {
    this.seen.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
const see = (el: Element, ratio: number) => act(() => observers[0]!.cb([{ target: el, isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver));

const previews = (c: HTMLElement) => c.querySelectorAll("[data-preview-layer]");

beforeEach(() => {
  vi.useFakeTimers();
  observers.length = 0;
  resetPreviewFocus();
  vi.stubGlobal("IntersectionObserver", FakeIO);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "connection", { value: undefined, configurable: true });
});

describe("VideoCard preview on a desktop", () => {
  beforeEach(() => media({ "(hover: hover)": true }));

  it("requests nothing until the pointer has rested, then fades the preview in, and unloads it on leave", () => {
    const { container } = render(<VideoCard href="/" title="Clip" poster="/still.jpg" previewSrc="/preview.webp" />);
    const article = container.querySelector("article") as HTMLElement;
    expect(previews(container)).toHaveLength(0);
    fireEvent.mouseEnter(article);
    act(() => void vi.advanceTimersByTime(199));
    expect(previews(container)).toHaveLength(0);
    act(() => void vi.advanceTimersByTime(1));
    const layer = previews(container)[0] as HTMLImageElement;
    expect(layer.getAttribute("src")).toBe("/preview.webp");
    expect(layer.hasAttribute("data-ready")).toBe(false); // transparent until loaded
    fireEvent.load(layer);
    expect(layer.hasAttribute("data-ready")).toBe(true);
    expect(layer.className).toContain("transition-opacity");
    expect(container.querySelector("img[src='/still.jpg']")).not.toBeNull(); // the poster stays under it
    fireEvent.mouseLeave(article);
    expect(previews(container)).toHaveLength(0);
  });

  it("a pointer that only crosses the card loads nothing", () => {
    const { container } = render(<VideoCard href="/" title="Clip" poster="/still.jpg" previewSrc="/preview.webp" />);
    const article = container.querySelector("article") as HTMLElement;
    fireEvent.mouseEnter(article);
    act(() => void vi.advanceTimersByTime(120));
    fireEvent.mouseLeave(article);
    act(() => void vi.advanceTimersByTime(1000));
    expect(previews(container)).toHaveLength(0);
  });

  it("keyboard focus starts it the same way", () => {
    const { container } = render(<VideoCard href="/" title="Clip" poster="/still.jpg" previewSrc="/preview.webp" previewDelay={50} />);
    fireEvent.focus(screen.getByRole("link", { name: "Clip" }));
    act(() => void vi.advanceTimersByTime(50));
    expect(previews(container)).toHaveLength(1);
    fireEvent.blur(screen.getByRole("link", { name: "Clip" }));
    expect(previews(container)).toHaveLength(0);
  });

  it("never loads the preview of a blurred picture, nor under Save-Data", () => {
    const { container, unmount } = render(<VideoCard href="/" title="Clip" poster="/s.jpg" previewSrc="/p.webp" blurred />);
    fireEvent.mouseEnter(container.querySelector("article") as HTMLElement);
    act(() => void vi.advanceTimersByTime(500));
    expect(previews(container)).toHaveLength(0);
    unmount();
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    const again = render(<VideoCard href="/" title="Clip" poster="/s.jpg" previewSrc="/p.webp" />);
    fireEvent.mouseEnter(again.container.querySelector("article") as HTMLElement);
    act(() => void vi.advanceTimersByTime(500));
    expect(previews(again.container)).toHaveLength(0);
  });

  it("puts the priority of the poster on the image", () => {
    const { container } = render(<VideoCard href="/" title="Clip" poster="/still.jpg" loading="eager" posterPriority="high" />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.getAttribute("loading")).toBe("eager");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });
});

describe("VideoCard preview on a phone", () => {
  beforeEach(() => media({ "(hover: hover)": false }));

  const two = () =>
    render(
      <>
        <VideoCard href="/a" title="A" poster="/a.jpg" previewSrc="/a.webp" />
        <VideoCard href="/b" title="B" poster="/b.jpg" previewSrc="/b.webp" />
      </>,
    );

  it("plays only the card most inside the viewport", () => {
    const { container } = two();
    const [a, b] = [...container.querySelectorAll("article")] as HTMLElement[];
    see(a!, 0.7);
    see(b!, 0.9);
    act(() => void vi.advanceTimersByTime(200));
    expect(a!.querySelector("[data-preview-layer]")).toBeNull();
    expect(b!.querySelector("[data-preview-layer]")?.getAttribute("src")).toBe("/b.webp");
    see(b!, 0.2);
    expect(b!.querySelector("[data-preview-layer]")).toBeNull();
    act(() => void vi.advanceTimersByTime(200));
    expect(a!.querySelector("[data-preview-layer]")?.getAttribute("src")).toBe("/a.webp");
  });

  it("plays nothing when no card is mostly in view, under reduced motion, or under Save-Data", () => {
    const { container } = two();
    const [a] = [...container.querySelectorAll("article")] as HTMLElement[];
    see(a!, 0.4);
    act(() => void vi.advanceTimersByTime(500));
    expect(previews(container)).toHaveLength(0);
    media({ "(hover: hover)": false, "(prefers-reduced-motion: reduce)": true });
    see(a!, 1);
    act(() => void vi.advanceTimersByTime(500));
    expect(previews(container)).toHaveLength(0);
  });

  it("a tap does not start a hover preview", () => {
    const { container } = render(<VideoCard href="/" title="Clip" poster="/s.jpg" previewSrc="/p.webp" />);
    fireEvent.mouseEnter(container.querySelector("article") as HTMLElement);
    act(() => void vi.advanceTimersByTime(500));
    expect(previews(container)).toHaveLength(0);
  });
});
