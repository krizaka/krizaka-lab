// MetaRow on React Native: a list of facts, the dots hidden from the screen reader, chips after.
import { afterEach, describe, expect, test } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react-native";

import { Badge } from "./badge";
import { MetaRow } from "./meta-row";

afterEach(async () => cleanup());

describe("MetaRow (native)", () => {
  test("is a named list with one item per fact, empty ones skipped", async () => {
    await render(<MetaRow label="Video" items={["HD 720p", null, "9:16", false, "0:05"]} />);
    expect(screen.getByLabelText("Video")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("HD 720p")).toBeTruthy();
    expect(screen.queryAllByText("·")).toHaveLength(0); // hidden from the screen reader
    expect(screen.getAllByText("·", { includeHiddenElements: true })).toHaveLength(2);
  });

  test("puts status chips after the facts without a dot", async () => {
    await render(<MetaRow items={["0:05"]} chips={[<Badge key="a">Encoding</Badge>]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Encoding")).toBeTruthy();
    expect(screen.queryAllByText("·")).toHaveLength(0);
  });
});
