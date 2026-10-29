import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../test/axe";
import { cutRect, hexagon, IsoHub, IsoLink, IsoScene, IsoStack, IsoTile, project } from "./index";

const css = readFileSync(join(import.meta.dirname, "../motion.css"), "utf8");

describe("iso geometry", () => {
  it("projects the world isometrically and builds the Krizaka footprints", () => {
    expect(project([0, 0, 10])).toEqual([0, -10]);
    const [x, y] = project([10, 0, 0]);
    expect(x).toBeCloseTo(8.66, 2);
    expect(y).toBe(5);
    expect(hexagon(0, 0, 10)).toHaveLength(6);
    expect(cutRect(0, 0, 20, 20, 4)).toHaveLength(8);
    expect(cutRect(0, 0, 20, 20, 0)).toHaveLength(4);
  });
});

describe("IsoScene", () => {
  it("is decorative without a label, a named group with one", async () => {
    const { container, rerender } = render(<IsoScene />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<IsoScene label="A server" description="One server under a dome." />);
    const scene = screen.getByRole("group", { name: "A server" });
    expect(scene.querySelector("desc")?.textContent).toBe("One server under a dome.");
    expect(scene.hasAttribute("data-motion-scope")).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("gives every scene its own mask ids", () => {
    const { container } = render(
      <>
        <IsoScene />
        <IsoScene />
      </>,
    );
    const ids = [...container.querySelectorAll("mask")].map((m) => m.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("IsoStack and IsoTile", () => {
  it("names each stage, makes it focusable, and stacks the entrance in order", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <IsoScene label="Stack">
        <IsoStack layers={[{ label: "Data" }, { label: "Models" }]} core="Core" />
        <IsoTile at={[200, 0]} label="Chats" glyph="dots" />
      </IsoScene>,
    );
    const names = screen.getAllByRole("img").map((el) => el.getAttribute("aria-label"));
    expect(names).toEqual(["Data", "Models", "Core", "Chats"]);
    await user.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Data");
    const order = [...container.querySelectorAll<SVGGElement>(".kz-iso-item")].slice(0, 4).map((g) => Number(g.style.getPropertyValue("--kz-iso-i")));
    expect(order).toEqual([0, 1, 2, 3]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("keeps still objects out of the loops", () => {
    const { container } = render(
      <IsoScene animated={false}>
        <IsoTile at={[0, 0]} animated={false} />
        <IsoLink from={[0, 0]} to={[100, 100]} animated={false} />
      </IsoScene>,
    );
    expect(container.querySelector(".kz-loop")).toBeNull();
    expect(container.querySelector(".kz-iso-rise")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("data-animated")).toBe("false");
  });
});

describe("IsoLink", () => {
  it("moves particles along its own path, spread along it when still", () => {
    const { container } = render(
      <svg>
        <IsoLink from={[0, 0]} to={[100, 50]} particles={2} label="+ €5" />
      </svg>,
    );
    const dots = container.querySelectorAll<SVGCircleElement>(".kz-iso-particle");
    expect(dots).toHaveLength(2);
    expect(dots[0]!.style.getPropertyValue("--kz-iso-at")).toBe("25%");
    expect(dots[1]!.style.getPropertyValue("--kz-iso-at")).toBe("75%");
    expect(container.textContent).toContain("+ €5");
  });
});

describe("IsoHub", () => {
  it("draws the centre and every satellite, sides first, framed to what it draws", async () => {
    const { container } = render(
      <IsoHub
        label="Hub"
        dome="Yours"
        layers={[{ label: "A" }]}
        satellites={[{ label: "Tips", glyph: "coin", value: "+ €5" }, { label: "Unlocks" }, { label: "Bids", flow: "out" }]}
        highlight={{ strong: "90 %", text: "to the creator" }}
      />,
    );
    for (const name of ["A", "Tips", "Unlocks", "Bids"]) expect(screen.getByRole("img", { name })).toBeTruthy();
    expect(container.querySelectorAll(".kz-iso-link")).toHaveLength(3);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toMatch(/^-?\d+ -?\d+ \d+ \d+$/);
    expect(container.textContent).toContain("90 %");
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("motion.css (iso)", () => {
  it("reads the tokens, keeps light out of the pointer's way, and rests under reduced motion", () => {
    expect(css).toContain(".kz-iso-accent .kz-iso-top { fill: color-mix(in oklab, var(--kz-accent)");
    expect(css).toMatch(/:is\(\.kz-iso-floor[^{]*\.kz-iso-dome[^{]*\{\s*pointer-events: none;/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{[\s\S]*\.kz-loop, \.kz-iso-rise/);
    expect(css).toContain("offset-distance: var(--kz-iso-at, 50%)");
  });
});
