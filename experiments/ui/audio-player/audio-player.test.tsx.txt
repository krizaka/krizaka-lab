import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeViolations } from "../test/axe";
import { AudioPlayer, resamplePeaks } from "./index";

describe("resamplePeaks", () => {
  it("keeps the maximum of each slice, normalised", () => {
    expect(resamplePeaks([0.1, 0.5, 0.2, 0.25], 2)).toEqual([1, 0.5]);
    expect(resamplePeaks([], 3)).toEqual([0.15, 0.15, 0.15]);
  });
});

describe("AudioPlayer", () => {
  it("is a named group with a seekable waveform read as a time, with no axe violation", async () => {
    const { container } = render(<AudioPlayer title="Voice note" src="/note.m4a" peaks={[0.2, 0.8, 0.4]} bars={12} duration={42} />);
    expect(screen.getByRole("group", { name: "Voice note" })).toBeTruthy();
    const wave = screen.getByRole("slider", { name: "Seek" });
    expect(wave.getAttribute("aria-valuetext")).toBe("0:00 of 0:42");
    expect(container.querySelectorAll("[data-played], span[aria-hidden]").length).toBeGreaterThanOrEqual(12);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("seeks with the keyboard and cycles the speed", async () => {
    const user = userEvent.setup();
    render(<AudioPlayer title="Note" src="/note.m4a" duration={42} />);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    screen.getByRole("slider").focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(audio.currentTime).toBe(10);
    await user.keyboard("{End}");
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("42");
    await user.click(screen.getByRole("button", { name: "Speed 1×" }));
    expect(audio.playbackRate).toBe(1.5);
  });
});
