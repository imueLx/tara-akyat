import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DifficultyPill } from "@/components/mountains/difficulty-pill";

describe("DifficultyPill", () => {
  it("opens a difficulty modal when interactive and restores keyboard focus on close", async () => {
    render(
      <DifficultyPill
        score={3}
        interactive
        note="Reference score for this mountain route."
        sourceUrl="https://example.com/source"
      />,
    );

    const trigger = screen.getByRole("button", { name: /3\/9 beginner/i });
    trigger.focus();

    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Reference score for this mountain route./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open difficulty source/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(dialog).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("link", { name: /Open difficulty source/i })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
