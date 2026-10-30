import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../test/axe";
import { Marquee } from "./index";

describe("Marquee", () => {
  it("is a named region whose items are read once, with no axe violation", async () => {
    const { container } = render(
      <main>
        <Marquee label="Partners" pauseLabel="Pause" playLabel="Play">
          <span>Postgres</span>
          <span>Kafka</span>
        </Marquee>
      </main>,
    );
    const region = screen.getByRole("region", { name: "Partners" });
    const lists = region.querySelectorAll("ul");
    expect(lists).toHaveLength(2);
    expect(lists[1]?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("pauses and plays with its button", async () => {
    const user = userEvent.setup();
    render(
      <Marquee label="Partners" pauseLabel="Pause" playLabel="Play">
        <span>Postgres</span>
      </Marquee>,
    );
    const region = screen.getByRole("region");
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(region.hasAttribute("data-paused")).toBe(true);
    const play = screen.getByRole("button", { name: "Play" });
    expect(play.getAttribute("aria-pressed")).toBe("true");
    await user.click(play);
    expect(region.hasAttribute("data-paused")).toBe(false);
  });

  it("sets its duration from its width and speed", () => {
    const { container } = render(
      <Marquee label="Partners" pauseLabel="Pause" playLabel="Play" speed={50}>
        <span>Postgres</span>
      </Marquee>,
    );
    expect((container.querySelector(".kz-marquee") as HTMLElement).style.getPropertyValue("--kz-marquee-duration")).toMatch(/s$/);
  });
});
