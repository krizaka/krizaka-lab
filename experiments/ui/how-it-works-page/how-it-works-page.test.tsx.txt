import { render, screen } from "@testing-library/react";

import Example from "../../registry/examples/how-it-works-page/orazaka";
import { axeViolations } from "../test/axe";
import { HowItWorksPage } from "./index";

describe("HowItWorksPage", () => {
  it("renders the template with its h1, its parts, and no axe violation", async () => {
    const { container } = render(<Example />);
    expect(screen.getByRole("heading", { level: 1, name: "The journey of a request" })).toBeTruthy();
    expect(container.querySelectorAll(".kz-tpl-step")).toHaveLength(3);
    expect(screen.getByRole("heading", { level: 2, name: "Install" })).toBeTruthy();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("is exported", () => {
    expect(typeof HowItWorksPage).toBe("function");
  });
});
