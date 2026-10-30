import { render, screen } from "@testing-library/react";

import { Badge } from "../badge";
import { axeViolations } from "../test/axe";
import { MetaRow } from "./index";

describe("MetaRow", () => {
  it("is one list of facts separated by dots that assistive technology never reads", async () => {
    const { container } = render(<MetaRow aria-label="Video" items={["HD 720p", "9:16", "0:05"]} />);
    const list = screen.getByRole("list", { name: "Video" });
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(list.textContent).toBe("HD 720p·9:16·0:05");
    const dots = container.querySelectorAll("[aria-hidden]");
    expect(dots).toHaveLength(2);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("skips empty facts so no dot is left dangling", () => {
    render(<MetaRow items={[null, "9:16", false, "", "0:05", undefined]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("list").textContent).toBe("9:16·0:05");
  });

  it("puts status chips after the facts, with no dot before them", () => {
    render(<MetaRow items={["0:05"]} chips={[<Badge key="a">Encoding</Badge>, null]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1]?.textContent).toBe("Encoding");
  });

  it("has a larger size and merges a className", () => {
    render(<MetaRow items={["a"]} size="md" className="mt-2" />);
    const list = screen.getByRole("list");
    expect(list.className).toContain("text-sm");
    expect(list.className).toContain("mt-2");
  });
});
